import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';
import PrimitiveCollection from 'cesium/Source/Scene/PrimitiveCollection';
import GeometryInstance from 'cesium/Source/Core/GeometryInstance';
import PolylineGeometry from 'cesium/Source/Core/PolylineGeometry';
import GroundPolylineGeometry from 'cesium/Source/Core/GroundPolylineGeometry';
import ColorGeometryInstanceAttribute from 'cesium/Source/Core/ColorGeometryInstanceAttribute';
import GroundPolylinePrimitive from 'cesium/Source/Scene/GroundPolylinePrimitive';
import Primitive from 'cesium/Source/Scene/Primitive';
import PolylineColorAppearance from 'cesium/Source/Scene/PolylineColorAppearance';

import { CesiumGeometryPrimitiveRenderer } from './cesium-geometry-primitive-renderer';

export class CesiumLinePrimitiveRenderer implements CesiumGeometryPrimitiveRenderer {

    protected polylines_: PrimitiveCollection;
    protected clampToGround_: boolean = false;
    protected pickCallbacks_;

    constructor(config) {
        this.clampToGround_ = config.clampToGround || false;
        this.pickCallbacks_ = config.pickCallbacks;

        this.polylines_ = new PrimitiveCollection();
    }

    getPrimitives() {
        return this.polylines_;
    }

    addFeature(id, geometry, style, data) {

        let instances;
        if (geometry.type === 'LineString') {
            instances = this.createPolylineInstance_(id, geometry.coordinates, style);
        } else if (geometry.type === 'MultiLineString') {
            instances = [];
            let lines = geometry.coordinates;
            for (let i = 0; i < lines.length; ++i) {
                instances.push(this.createPolylineInstance_(`${id}_${i}`, lines[i], style));
            }
        }

        let primitiveProps = {
            show: style.visible,
            geometryInstances: instances,
            appearance: new PolylineColorAppearance({
                translucent: false
            })
        };

        let primitive;
        if (this.clampToGround_) {
            primitive = this.polylines_.add(new GroundPolylinePrimitive(primitiveProps));
        } else {
            primitive = this.polylines_.add(new Primitive(primitiveProps));
        }

        primitive.entityId_ = id;
        primitive.pickingDisabled_ = style.pickingDisabled || false;
        primitive.pickCallbacks_ = this.pickCallbacks_;
        primitive.data_ = data;

        let feature = {
            id: id,
            primitive: primitive,
            numGeometries: instances.length,
            style: style,
            geometry: geometry,
            data: data
        };

        return feature;
    }


    updateGeometry(feature, geometry) {

        this.removeFeature(feature);

        let updatedFeature = this.addFeature(feature.id, geometry, feature.style, feature.data);
        feature.primitive = updatedFeature.primitive;
        feature.numGeometries = updatedFeature.numGeometries;
        feature.geometry = geometry;
    }

    updateStyle(feature, style) {

        if (style.width !== feature.style.width) {
            let oldPrimitive = feature.primitive;
            let updatedFeature = this.addFeature(feature.id, feature.geometry, style, feature.data);
            feature.primitive = updatedFeature.primitive;
            //updatedFeature.primitive.readyPromise.then(() => {
                this.polylines_.remove(oldPrimitive);
            //});

        } else {
            if (feature.numGeometries) {
                for (let i = 0; i < feature.numGeometries; ++i) {
                    let attributes = feature.primitive.getGeometryInstanceAttributes(`${feature.id}_${i}`);
                    attributes.color = ColorGeometryInstanceAttribute.toValue(new Color(...style.color));
                }
            } else {
                let attributes = feature.primitive.getGeometryInstanceAttributes(feature.id);
                attributes.color = ColorGeometryInstanceAttribute.toValue(new Color(...style.color));
            }

            feature.primitive.show = style.visible;
        }

        feature.style = style;

        feature.primitive.pickingDisabled_ = style.pickingDisabled || false;
    }

    removeFeature(feature) {
        this.polylines_.remove(feature.primitive);
    }


    clear() {
        this.polylines_.removeAll();
    }

    destroy() {
        this.polylines_.destroy();
    }


    protected isMultiLine_(feature) {
        return (feature instanceof Array);
    }


    protected createPolylineInstance_(id, coordinates, style) {

        let polylineGeometry;
        let polylineProps = {
            positions: Cartesian3.fromDegreesArray([].concat(...coordinates)),
            width: style.width,
            vertexFormat : PolylineColorAppearance.VERTEX_FORMAT
        };

        if (this.clampToGround_) {
            polylineGeometry = new GroundPolylineGeometry(polylineProps);
        } else {
            polylineGeometry = new PolylineGeometry(polylineProps);
        }

        let polygonInstance = new GeometryInstance({
            geometry: polylineGeometry,
            attributes : {
                color : new ColorGeometryInstanceAttribute(...style.color)
            },
            id: id
        });

        return polygonInstance;
    }

}

