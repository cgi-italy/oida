import {
    Cartesian3,
    Color,
    PrimitiveCollection,
    GeometryInstance,
    PolygonGeometry,
    PolygonOutlineGeometry,
    PolygonHierarchy,
    RectangleGeometry,
    RectangleOutlineGeometry,
    Rectangle,
    CircleGeometry as CesiumCircleGeometry,
    CircleOutlineGeometry,
    ColorGeometryInstanceAttribute,
    GroundPrimitive,
    Primitive,
    PerInstanceColorAppearance
} from 'cesium';

import { BBoxGeometry, CircleGeometry, getGeometryExtent, IPolygonStyle, MapCoord } from '@oidajs/core';

import { PICK_INFO_KEY, PickInfo } from '../../../utils/picking';
import { CesiumPrimitiveFeatureLayer } from '../cesium-primitive-feature-layer';
import { CesiumGeometryPrimitiveFeature, CesiumGeometryPrimitiveRenderer } from './cesium-geometry-primitive-renderer';

type PolygonInputGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon | BBoxGeometry | CircleGeometry;
export type CesiumPolygonPrimitiveRenderProps = {
    fillPrimitive: Primitive | GroundPrimitive;
    strokePrimitive: Primitive;
    numGeometries: number;
};

export type CesiumPolygonPrimitiveFeature = CesiumGeometryPrimitiveFeature<CesiumPolygonPrimitiveRenderProps, IPolygonStyle>;

export class CesiumPolygonPrimitiveRenderer implements CesiumGeometryPrimitiveRenderer<CesiumPolygonPrimitiveFeature> {
    protected polygons_: PrimitiveCollection;
    protected clampToGround_: boolean;
    protected layer_: CesiumPrimitiveFeatureLayer;
    protected pickCallbacks_;

    constructor(config) {
        this.polygons_ = new PrimitiveCollection();

        this.clampToGround_ = config.clampToGround || false;
        this.layer_ = config.layer;
        this.pickCallbacks_ = config.pickCallbacks;
    }

    getPrimitives() {
        return this.polygons_;
    }

    addFeature(id: string, geometry: PolygonInputGeometry, style: IPolygonStyle, data: any) {
        let fillInstances: any = null;
        let outlineInstances: any = null;

        if (geometry.type === 'Polygon') {
            const instance = this.createPolygonInstance_(id, geometry.coordinates, style);
            fillInstances = instance.fill;
            outlineInstances = instance.outline;
        } else if (geometry.type === 'MultiPolygon') {
            fillInstances = [];
            outlineInstances = [];
            for (let i = 0; i < geometry.coordinates.length; ++i) {
                const instance = this.createPolygonInstance_(`${id}_${i}`, geometry.coordinates[i], style);
                fillInstances.push(instance.fill);
                outlineInstances.push(instance.outline);
            }
        } else if (geometry.type === 'BBox') {
            const instance = this.createRectangleInstance_(id, geometry.bbox, style);
            fillInstances = instance.fill;
            outlineInstances = instance.outline;
        } else if (geometry.type === 'Circle') {
            const instance = this.createCircleInstance_(id, geometry.center, geometry.radius, style);
            fillInstances = instance.fill;
            outlineInstances = instance.outline;
        }

        // cesium has a bug in filling large polygons: https://github.com/CesiumGS/cesium/issues/4871
        // disable fill when the bounding box is bigger than half of the globe (is this a good heuristic for "large"?)
        // TODO: split polygon in tiles?
        const bbox = getGeometryExtent(geometry);
        if (bbox && (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]) > 32400) {
            fillInstances = [];
        }

        let fill;
        if (this.clampToGround_) {
            fill = this.polygons_.add(
                new GroundPrimitive({
                    show: style.visible,
                    geometryInstances: fillInstances,
                    appearance: new PerInstanceColorAppearance({
                        flat: true
                    })
                })
            );
        } else {
            fill = this.polygons_.add(
                new Primitive({
                    show: style.visible,
                    geometryInstances: fillInstances,
                    appearance: new PerInstanceColorAppearance({
                        flat: true
                    })
                })
            );
        }

        const stroke = this.polygons_.add(
            new Primitive({
                show: style.visible,
                geometryInstances: outlineInstances,
                appearance: new PerInstanceColorAppearance({
                    flat: true,
                    renderState: {
                        lineWidth: 1
                    }
                })
            })
        );

        const feature = {
            id: id,
            geometryRenderer: this as CesiumPolygonPrimitiveRenderer,
            geometryType: geometry.type,
            style: style,
            data: data,
            renderProps: {
                fillPrimitive: fill,
                strokePrimitive: stroke,
                numGeometries: outlineInstances.length
            }
        };

        const pickInfo: PickInfo = {
            id: id,
            data: data,
            layer: this.layer_,
            pickable: !style.pickingDisabled
        };

        fill[PICK_INFO_KEY] = pickInfo;
        stroke[PICK_INFO_KEY] = pickInfo;

        return feature;
    }

    updateGeometry(feature: CesiumPolygonPrimitiveFeature, geometry: PolygonInputGeometry) {
        this.removeFeature(feature);

        const updatedFeature = this.addFeature(feature.id, geometry, feature.style, feature.data);
        feature.renderProps = updatedFeature.renderProps;
    }

    updateStyle(feature: CesiumPolygonPrimitiveFeature, style: IPolygonStyle) {
        this.updatePrimitiveColor_(feature.renderProps.fillPrimitive, style.fillColor);
        this.updatePrimitiveColor_(feature.renderProps.strokePrimitive, style.strokeColor);

        feature.renderProps.fillPrimitive.show = style.visible;
        feature.renderProps.strokePrimitive.show = style.visible;
        feature.renderProps.fillPrimitive[PICK_INFO_KEY].pickable = !style.pickingDisabled;
        feature.renderProps.strokePrimitive[PICK_INFO_KEY].pickable = !style.pickingDisabled;

        feature.style = style;
    }

    removeFeature(feature: CesiumPolygonPrimitiveFeature) {
        this.polygons_.remove(feature.renderProps.fillPrimitive);
        this.polygons_.remove(feature.renderProps.strokePrimitive);
    }

    clear() {
        this.polygons_.removeAll();
    }

    destroy() {
        this.polygons_.destroy();
    }

    protected createPolygonInstance_(id: string, coordinates, style: IPolygonStyle) {
        let polygonInstance: GeometryInstance | undefined;
        let outlineInstance: GeometryInstance | undefined;

        const outer = coordinates[0];
        const holes: PolygonHierarchy[] = [];
        for (let i = 1; i < coordinates.length; ++i) {
            if (coordinates[i].length > 2) {
                holes.push(new PolygonHierarchy(Cartesian3.fromDegreesArray([].concat(...coordinates[i]))));
            }
        }

        if (outer.length >= 2) {
            const polygonHierarchy = new PolygonHierarchy(Cartesian3.fromDegreesArray([].concat(...outer)), holes);

            polygonInstance = new GeometryInstance({
                geometry: new PolygonGeometry({
                    polygonHierarchy: polygonHierarchy,
                    vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT
                }),
                attributes: {
                    color: new ColorGeometryInstanceAttribute(...style.fillColor!)
                },
                id: id
            });

            outlineInstance = new GeometryInstance({
                geometry: new PolygonOutlineGeometry({
                    polygonHierarchy: polygonHierarchy,
                    vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT
                }),
                attributes: {
                    color: new ColorGeometryInstanceAttribute(...style.strokeColor!)
                },
                id: id
            });
        }

        return {
            fill: polygonInstance,
            outline: outlineInstance
        };
    }

    protected createRectangleInstance_(id: string, extent, style: IPolygonStyle) {
        const rectangleInstance = new GeometryInstance({
            geometry: new RectangleGeometry({
                rectangle: Rectangle.fromDegrees(...extent),
                vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT
            }),
            attributes: {
                color: new ColorGeometryInstanceAttribute(...style.fillColor!)
            },
            id: id
        });

        const outlineInstance = new GeometryInstance({
            geometry: new RectangleOutlineGeometry({
                rectangle: Rectangle.fromDegrees(...extent)
            }),
            attributes: {
                color: new ColorGeometryInstanceAttribute(...style.strokeColor!)
            },
            id: id
        });

        return {
            fill: rectangleInstance,
            outline: outlineInstance
        };
    }

    protected createCircleInstance_(id: string, center: GeoJSON.Position, radius: number, style: IPolygonStyle) {
        const circleInstance = new GeometryInstance({
            geometry: new CesiumCircleGeometry({
                center: Cartesian3.fromDegrees(...(center as MapCoord)),
                radius: radius,
                vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT
            }),
            attributes: {
                color: new ColorGeometryInstanceAttribute(...style.fillColor!)
            },
            id: id
        });

        const outlineInstance = new GeometryInstance({
            geometry: new CircleOutlineGeometry({
                center: Cartesian3.fromDegrees(...(center as MapCoord)),
                radius: radius
            }),
            attributes: {
                color: new ColorGeometryInstanceAttribute(...style.strokeColor!)
            },
            id: id
        });

        return {
            fill: circleInstance,
            outline: outlineInstance
        };
    }

    protected updatePrimitiveColor_(primitive: Primitive | GroundPrimitive, color) {
        if (primitive.ready) {
            // @ts-ignore: private member access
            const instanceIds = primitive._instanceIds;
            instanceIds.forEach((id) => {
                const attributes = primitive.getGeometryInstanceAttributes(id);
                attributes.color = ColorGeometryInstanceAttribute.toValue(new Color(...color));
            });
        } else {
            const geometryInstances: GeometryInstance[] = Array.isArray(primitive.geometryInstances)
                ? primitive.geometryInstances
                : [primitive.geometryInstances];

            geometryInstances.forEach((instance) => {
                instance.attributes.color = new ColorGeometryInstanceAttribute(...color);
            });
        }
    }
}
