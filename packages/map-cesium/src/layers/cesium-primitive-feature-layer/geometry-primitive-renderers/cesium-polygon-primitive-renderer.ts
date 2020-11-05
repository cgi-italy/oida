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
import CircleGeometry from 'cesium/Source/Core/CircleGeometry';
import CircleOutlineGeometry from 'cesium/Source/Core/CircleOutlineGeometry';
import ColorGeometryInstanceAttribute from 'cesium/Source/Core/ColorGeometryInstanceAttribute';
import GroundPrimitive from 'cesium/Source/Scene/GroundPrimitive';
import Primitive from 'cesium/Source/Scene/Primitive';
import PerInstanceColorAppearance from 'cesium/Source/Scene/PerInstanceColorAppearance';

import { CesiumGeometryPrimitiveRenderer } from './cesium-geometry-primitive-renderer';

export class CesiumPolygonPrimitiveRenderer implements CesiumGeometryPrimitiveRenderer {

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

    addFeature(id, geometry, style, data) {
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
            fill: fill,
            stroke: stroke,
            numGeometries: fillInstances.length,
            style: style,
            data: data
        };

        return feature;
    }


    updateGeometry(feature, geometry) {
        this.removeFeature(feature);

        let updatedFeature = this.addFeature(feature.id, geometry, feature.style, feature.data);
        feature.fill = updatedFeature.fill;
        feature.stroke = updatedFeature.stroke;
        feature.numGeometries = updatedFeature.numGeometries;

    }

    updateStyle(feature, style) {

        this.updatePrimitiveColor_(feature.fill, style.fillColor);
        this.updatePrimitiveColor_(feature.stroke, style.strokeColor);

        feature.stroke.show = style.visible;
        feature.fill.show = style.visible;

        feature.fill.pickingDisabled_ = style.pickingDisabled || false;
        feature.stroke.pickingDisabled_ = style.pickingDisabled || false;

        feature.style = style;

    }

    removeFeature(feature) {
        this.polygons_.remove(feature.fill);
        this.polygons_.remove(feature.stroke);
    }


    clear() {
        this.polygons_.removeAll();
    }

    destroy() {
        this.polygons_.destroy();
    }

    protected createPolygonInstance_(id, coordinates, style) {

        let polygonInstance = null;
        let outlineInstance = null;

        let outer = coordinates[0];
        let holes: any[] = [];
        for (let i = 1; i < coordinates.length; ++i) {
            if (coordinates[i].length > 2) {
                holes.push(new PolygonHierarchy(
                    Cartesian3.fromDegreesArray([].concat(...coordinates[i]))
                ));
            }
        }

        if (outer.length >= 2) {
            let polygonHierarchy = new PolygonHierarchy(
                Cartesian3.fromDegreesArray([].concat(...outer)),
                holes
            );

            polygonInstance = new GeometryInstance({
                geometry: new PolygonGeometry({
                    polygonHierarchy: polygonHierarchy,
                    vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
                }),
                attributes: {
                    color: new ColorGeometryInstanceAttribute(...style.fillColor)
                },
                id: id
            });

            outlineInstance = new GeometryInstance({
                geometry: new PolygonOutlineGeometry({
                    polygonHierarchy: polygonHierarchy,
                    vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
                }),
                attributes: {
                    color: new ColorGeometryInstanceAttribute(...style.strokeColor)
                },
                id: id
            });

        }

        return {
            fill: polygonInstance,
            outline: outlineInstance
        };
    }

    protected createRectangleInstance_(id, extent, style) {

        let rectangleInstance = new GeometryInstance({
            geometry: new RectangleGeometry({
                rectangle: Rectangle.fromDegrees(...extent),
                vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
            }),
            attributes: {
                color: new ColorGeometryInstanceAttribute(...style.fillColor)
            },
            id: id
        });

        let outlineInstance = new GeometryInstance({
            geometry: new RectangleOutlineGeometry({
                rectangle: Rectangle.fromDegrees(...extent),
                vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
            }),
            attributes: {
                color: new ColorGeometryInstanceAttribute(...style.strokeColor)
            },
            id: id
        });


        return {
            fill: rectangleInstance,
            outline: outlineInstance
        };
    }

    protected createCircleInstance_(id, center, radius, style) {

        let circleInstance = new GeometryInstance({
            geometry: new CircleGeometry({
                center: Cartesian3.fromDegrees(...center),
                radius: radius,
                vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
            }),
            attributes: {
                color: new ColorGeometryInstanceAttribute(...style.fillColor)
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
                color: new ColorGeometryInstanceAttribute(...style.strokeColor)
            },
            id: id
        });


        return {
            fill: circleInstance,
            outline: outlineInstance
        };
    }

    protected updatePrimitiveColor_(primitive, color) {

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
