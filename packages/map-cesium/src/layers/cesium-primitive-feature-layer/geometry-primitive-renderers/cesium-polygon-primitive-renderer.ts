import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';
import PrimitiveCollection from 'cesium/Source/Scene/PrimitiveCollection';
import GeometryInstance from 'cesium/Source/Core/GeometryInstance';
import PolygonGeometry from 'cesium/Source/Core/PolygonGeometry';
import PolygonOutlineGeometry from 'cesium/Source/Core/PolygonOutlineGeometry';
import PolygonHierarchy from 'cesium/Source/Core/PolygonHierarchy';
import RectangleGeometry from 'cesium/Source/Core/RectangleGeometry';
import RectangleOutlineGeometry from 'cesium/Source/Core/RectangleOutlineGeometry';
import Rectangle from 'cesium/Source/Core/Rectangle';
import CesiumCircleGeometry from 'cesium/Source/Core/CircleGeometry';
import CircleOutlineGeometry from 'cesium/Source/Core/CircleOutlineGeometry';
import ColorGeometryInstanceAttribute from 'cesium/Source/Core/ColorGeometryInstanceAttribute';
import GroundPrimitive from 'cesium/Source/Scene/GroundPrimitive';
import Primitive from 'cesium/Source/Scene/Primitive';
import PerInstanceColorAppearance from 'cesium/Source/Scene/PerInstanceColorAppearance';

import { BBoxGeometry, CircleGeometry, IPolygonStyle } from '@oida/core';

import { CesiumGeometryPrimitiveFeature, CesiumGeometryPrimitiveRenderer } from './cesium-geometry-primitive-renderer';

type PolygonGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon | BBoxGeometry | CircleGeometry;
export type CesiumPolygonPrimitiveRenderProps = {
    fillPrimitive: Primitive | GroundPrimitive;
    strokePrimitive: Primitive;
    numGeometries: number;
};

export type CesiumPolygonPrimitiveFeature = CesiumGeometryPrimitiveFeature<CesiumPolygonPrimitiveRenderProps, IPolygonStyle>;

export class CesiumPolygonPrimitiveRenderer implements CesiumGeometryPrimitiveRenderer<CesiumPolygonPrimitiveFeature> {

    protected polygons_: PrimitiveCollection;
    protected clampToGround_: boolean = false;
    protected pickCallbacks_;

    constructor(config) {
        this.polygons_ = new PrimitiveCollection();

        this.clampToGround_ = config.clampToGround || false;
        this.pickCallbacks_ = config.pickCallbacks;
    }

    getPrimitives() {
        return this.polygons_;
    }

    addFeature(id: string, geometry: PolygonGeometry, style: IPolygonStyle, data: any) {
        let fillInstances: any = null;
        let outlineInstances: any = null;

        if (geometry.type === 'Polygon') {

            let instance = this.createPolygonInstance_(id, geometry.coordinates, style);
            fillInstances = instance.fill;
            outlineInstances = instance.outline;
        } else if (geometry.type === 'MultiPolygon') {
            fillInstances = [];
            outlineInstances = [];
            for (let i = 0; i < geometry.coordinates.length; ++i) {
                let instance = this.createPolygonInstance_(`${id}_${i}`, geometry.coordinates[i], style);
                fillInstances.push(instance.fill);
                outlineInstances.push(instance.outline);
            }
        } else if (geometry.type === 'BBox') {
            let instance = this.createRectangleInstance_(id, geometry.bbox, style);
            fillInstances = instance.fill;
            outlineInstances = instance.outline;
        } else if (geometry.type === 'Circle') {
            let instance = this.createCircleInstance_(id, geometry.center, geometry.radius, style);
            fillInstances = instance.fill;
            outlineInstances = instance.outline;
        }

        let fill;
        if (this.clampToGround_) {
            fill = this.polygons_.add(new GroundPrimitive({
                show: style.visible,
                geometryInstances: fillInstances,
                appearance: new PerInstanceColorAppearance({
                    flat: true
                })
            }));
        } else {
            fill = this.polygons_.add(new Primitive({
                show: style.visible,
                geometryInstances: fillInstances,
                appearance: new PerInstanceColorAppearance({
                    flat: true
                })
            }));
        }

        let stroke = this.polygons_.add(new Primitive({
            show: style.visible,
            geometryInstances: outlineInstances,
            appearance: new PerInstanceColorAppearance({
                flat : true,
                renderState : {
                    lineWidth : 1
                }
            })
        }));

        fill.entityId_ = id;
        stroke.entityId_  = id;
        fill.pickingDisabled_ = style.pickingDisabled || false;
        stroke.pickingDisabled_ = style.pickingDisabled || false;
        fill.pickCallbacks_ = this.pickCallbacks_;
        stroke.pickCallbacks_ = this.pickCallbacks_;
        fill.data_ = data;
        stroke.data_ = data;

        let feature = {
            id: id,
            geometryRenderer: this as CesiumPolygonPrimitiveRenderer,
            geometryType: geometry.type,
            style: style,
            data: data,
            renderProps: {
                fillPrimitive: fill,
                strokePrimitive: stroke,
                numGeometries: fillInstances.length
            }
        };

        return feature;
    }

    updateGeometry(feature: CesiumPolygonPrimitiveFeature, geometry: PolygonGeometry) {
        this.removeFeature(feature);

        let updatedFeature = this.addFeature(feature.id, geometry, feature.style, feature.data);
        feature.renderProps = updatedFeature.renderProps;
    }

    updateStyle(feature: CesiumPolygonPrimitiveFeature, style: IPolygonStyle) {

        this.updatePrimitiveColor_(feature.renderProps.fillPrimitive, style.fillColor);
        this.updatePrimitiveColor_(feature.renderProps.strokePrimitive, style.strokeColor);

        feature.renderProps.fillPrimitive.show = style.visible;
        feature.renderProps.strokePrimitive.show = style.visible;
        feature.renderProps.fillPrimitive.pickingDisabled_ = style.pickingDisabled || false;
        feature.renderProps.strokePrimitive.pickingDisabled_ = style.pickingDisabled || false;

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
                holes.push(new PolygonHierarchy(
                    Cartesian3.fromDegreesArray([].concat(...coordinates[i]))
                ));
            }
        }

        if (outer.length >= 2) {
            const polygonHierarchy = new PolygonHierarchy(
                Cartesian3.fromDegreesArray([].concat(...outer)),
                holes
            );

            polygonInstance = new GeometryInstance({
                geometry: new PolygonGeometry({
                    polygonHierarchy: polygonHierarchy,
                    vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
                }),
                attributes: {
                    color: new ColorGeometryInstanceAttribute(...style.fillColor!)
                },
                id: id
            });

            outlineInstance = new GeometryInstance({
                geometry: new PolygonOutlineGeometry({
                    polygonHierarchy: polygonHierarchy,
                    vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
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

        let rectangleInstance = new GeometryInstance({
            geometry: new RectangleGeometry({
                rectangle: Rectangle.fromDegrees(...extent),
                vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
            }),
            attributes: {
                color: new ColorGeometryInstanceAttribute(...style.fillColor!)
            },
            id: id
        });

        let outlineInstance = new GeometryInstance({
            geometry: new RectangleOutlineGeometry({
                rectangle: Rectangle.fromDegrees(...extent),
                vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
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

        let circleInstance = new GeometryInstance({
            geometry: new CesiumCircleGeometry({
                center: Cartesian3.fromDegrees(...center),
                radius: radius,
                vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
            }),
            attributes: {
                color: new ColorGeometryInstanceAttribute(...style.fillColor!)
            },
            id: id
        });

        let outlineInstance = new GeometryInstance({
            geometry: new CircleOutlineGeometry({
                center: Cartesian3.fromDegrees(...center),
                radius: radius,
                vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
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

    protected updatePrimitiveColor_(primitive: Primitive, color) {

        if (primitive.ready) {
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
