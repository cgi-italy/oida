import {
    Cartesian3,
    Color,
    PrimitiveCollection,
    GeometryInstance,
    PolylineGeometry,
    GroundPolylineGeometry,
    ColorGeometryInstanceAttribute,
    GroundPolylinePrimitive,
    Primitive,
    PolylineColorAppearance
} from 'cesium';

import { ILineStyle } from '@oidajs/core';

import { PICK_INFO_KEY, PickInfo } from '../../../utils/picking';
import { CesiumPrimitiveFeatureLayer } from '../cesium-primitive-feature-layer';
import { CesiumGeometryPrimitiveRenderer, CesiumGeometryPrimitiveFeature } from './cesium-geometry-primitive-renderer';

export type CesiumLinePrimitiveRenderProps = {
    geometry: GeoJSON.LineString | GeoJSON.MultiLineString;
    numGeometries: number;
    primitive: Primitive | GroundPolylinePrimitive;
    oldPrimitive?: Primitive | GroundPolylinePrimitive;
};

export type CesiumLinePrimitiveFeature = CesiumGeometryPrimitiveFeature<CesiumLinePrimitiveRenderProps, ILineStyle>;
export class CesiumLinePrimitiveRenderer implements CesiumGeometryPrimitiveRenderer<CesiumLinePrimitiveFeature> {
    protected polylines_: PrimitiveCollection;
    protected clampToGround_: boolean;
    protected layer_: CesiumPrimitiveFeatureLayer;

    constructor(config) {
        this.clampToGround_ = config.clampToGround || false;
        this.layer_ = config.layer;

        this.polylines_ = new PrimitiveCollection();
    }

    getPrimitives() {
        return this.polylines_;
    }

    addFeature(id: string, geometry: GeoJSON.LineString | GeoJSON.MultiLineString, style: ILineStyle, data: any) {
        let instances;
        if (geometry.type === 'LineString') {
            instances = this.createPolylineInstance_(id, geometry.coordinates, style);
        } else if (geometry.type === 'MultiLineString') {
            instances = [];
            const lines = geometry.coordinates;
            for (let i = 0; i < lines.length; ++i) {
                instances.push(this.createPolylineInstance_(`${id}_${i}`, lines[i], style));
            }
        }

        const primitiveProps = {
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

        const feature = {
            id: id,
            style: style,
            data: data,
            geometryType: geometry.type,
            geometryRenderer: this as CesiumLinePrimitiveRenderer,
            renderProps: {
                geometry: geometry,
                numGeometries: instances.length,
                primitive: primitive
            }
        };

        const pickInfo: PickInfo = {
            id: id,
            data: data,
            layer: this.layer_,
            pickable: !style.pickingDisabled
        };

        primitive[PICK_INFO_KEY] = pickInfo;

        return feature;
    }

    updateGeometry(feature, geometry) {
        this.updateFeature_(feature, { geometry: geometry });
    }

    updateStyle(feature: CesiumLinePrimitiveFeature, style: ILineStyle) {
        if (style.width !== feature.style.width) {
            // line width cannot be updated. recreate the feature
            this.updateFeature_(feature, { style: style });
        } else {
            const { id, renderProps } = feature;
            renderProps.primitive.readyPromise.then(() => {
                if (renderProps.numGeometries) {
                    for (let i = 0; i < renderProps.numGeometries; ++i) {
                        const attributes = renderProps.primitive.getGeometryInstanceAttributes(`${id}_${i}`);
                        if (style.color) {
                            attributes.color = ColorGeometryInstanceAttribute.toValue(new Color(...style.color!));
                        }
                    }
                } else {
                    const attributes = renderProps.primitive.getGeometryInstanceAttributes(id);
                    if (style.color) {
                        attributes.color = ColorGeometryInstanceAttribute.toValue(new Color(...style.color!));
                    }
                }
            });

            renderProps.primitive.show = style.visible;
            feature.style = style;

            renderProps.primitive[PICK_INFO_KEY].pickable = !style.pickingDisabled;
        }
    }

    removeFeature(feature: CesiumLinePrimitiveFeature) {
        if (feature.renderProps.oldPrimitive) {
            this.polylines_.remove(feature.renderProps.oldPrimitive);
        }
        this.polylines_.remove(feature.renderProps.primitive);
    }

    clear() {
        this.polylines_.removeAll();
    }

    destroy() {
        this.polylines_.destroy();
    }

    protected isMultiLine_(feature) {
        return feature instanceof Array;
    }

    protected createPolylineInstance_(id: string, coordinates, style: ILineStyle) {
        let polylineGeometry;
        const polylineProps = {
            positions: Cartesian3.fromDegreesArray([].concat(...coordinates)),
            width: style.width,
            vertexFormat: PolylineColorAppearance.VERTEX_FORMAT
        };

        if (this.clampToGround_) {
            polylineGeometry = new GroundPolylineGeometry(polylineProps);
        } else {
            polylineGeometry = new PolylineGeometry(polylineProps);
        }

        const polygonInstance = new GeometryInstance({
            geometry: polylineGeometry,
            attributes: {
                color: new ColorGeometryInstanceAttribute(...style.color!)
            },
            id: id
        });

        return polygonInstance;
    }

    protected updateFeature_(feature: CesiumLinePrimitiveFeature, props: { geometry?; style? }) {
        const renderProps = feature.renderProps;
        if (renderProps.oldPrimitive) {
            // there was a pending primitive update but the new primitive was not rendered yet.
            // remove it and act as if it was never updated
            this.polylines_.remove(renderProps.primitive);
            renderProps.primitive = renderProps.oldPrimitive;
        }
        const oldPrimitive = renderProps.primitive;
        const updatedFeature = this.addFeature(
            feature.id,
            props.geometry || renderProps.geometry,
            props.style || feature.style,
            feature.data
        );
        renderProps.primitive = updatedFeature.renderProps.primitive;
        renderProps.oldPrimitive = oldPrimitive;
        feature.style = updatedFeature.style;
        renderProps.geometry = updatedFeature.renderProps.geometry;
        renderProps.numGeometries = updatedFeature.renderProps.numGeometries;

        // to avoid flickering remove the old primitive only when the new primitive is ready to be rendered
        updatedFeature.renderProps.primitive.readyPromise.then(() => {
            this.polylines_.remove(oldPrimitive);
            if (feature.renderProps.oldPrimitive === oldPrimitive) {
                delete feature.renderProps.oldPrimitive;
            }
        });
    }
}
