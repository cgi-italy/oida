import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';
import PrimitiveCollection from 'cesium/Source/Scene/PrimitiveCollection';
import GeometryInstance from 'cesium/Source/Core/GeometryInstance';
import PolygonGeometry from 'cesium/Source/Core/PolygonGeometry';
import PolygonOutlineGeometry from 'cesium/Source/Core/PolygonOutlineGeometry';
import PolygonHierarchy from 'cesium/Source/Core/PolygonHierarchy';
import ColorGeometryInstanceAttribute from 'cesium/Source/Core/ColorGeometryInstanceAttribute';
import GroundPrimitive from 'cesium/Source/Scene/GroundPrimitive';
import Primitive from 'cesium/Source/Scene/Primitive';
import PerInstanceColorAppearance from 'cesium/Source/Scene/PerInstanceColorAppearance';

import { CesiumGeometryRenderer } from './cesium-geometry-renderer';

export class CesiumPolygonRenderer implements CesiumGeometryRenderer {

    protected polygons_: PrimitiveCollection;
    protected clampToGround_: boolean = false;

    constructor(config) {
        this.polygons_ = new PrimitiveCollection();

        this.clampToGround_ = config.clampToGround || false;
    }

    getPrimitives() {
        return this.polygons_;
    }

    addFeature(id, geometry, style) {
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

        let feature = {
            id: id,
            fill: fill,
            stroke: stroke,
            numGeometries: fillInstances.length,
            style: style
        };

        return feature;
    }


    updateGeometry(feature, geometry) {
        this.removeFeature(feature);

        let updatedFeature = this.addFeature(feature.id, geometry, feature.style);
        feature.fill = updatedFeature.fill;
        feature.stroke = updatedFeature.stroke;
        feature.numGeometries = updatedFeature.numGeometries;

    }

    updateStyle(feature, style) {

        if (feature.numGeometries) {
            for (let i = 0; i < feature.numGeometries; ++i) {
                let attributes = feature.fill.getGeometryInstanceAttributes(`${feature.id}_${i}`);
                attributes.color = ColorGeometryInstanceAttribute.toValue(new Color(...style.fillColor));
                attributes = feature.stroke.getGeometryInstanceAttributes(`${feature.id}_${i}`);
                attributes.color = ColorGeometryInstanceAttribute.toValue(new Color(...style.strokeColor));
            }
        } else {
            let attributes = feature.fill.getGeometryInstanceAttributes(feature.id);
            attributes.color = ColorGeometryInstanceAttribute.toValue(new Color(...style.fillColor));
            attributes = feature.stroke.getGeometryInstanceAttributes(feature.id);
            attributes.color = ColorGeometryInstanceAttribute.toValue(new Color(...style.strokeColor));
        }

        feature.stroke.show = style.visible;
        feature.fill.show = style.visible;

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

}
