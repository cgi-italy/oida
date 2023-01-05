import {
    PrimitiveCollection,
    Cartesian3,
    Color,
    HeightReference,
    BillboardCollection,
    PointPrimitiveCollection,
    Billboard,
    PointPrimitive
} from 'cesium';

import { IPointStyle, IIconStyle, ICircleStyle, isIcon, MapCoord } from '@oidajs/core';

import { PICK_INFO_KEY, PickInfo } from '../../../utils/picking';
import { CesiumGeometryPrimitiveFeature, CesiumGeometryPrimitiveRenderer } from './cesium-geometry-primitive-renderer';
import { CesiumPrimitiveFeatureLayer } from '../cesium-primitive-feature-layer';

export type CesiumPointPrimitiveRenderProps = {
    primitives: (Billboard | PointPrimitive)[];
};

export type CesiumPointPrimitiveFeature = CesiumGeometryPrimitiveFeature<CesiumPointPrimitiveRenderProps, IPointStyle>;

export class CesiumPointPrimitiveRenderer implements CesiumGeometryPrimitiveRenderer<CesiumPointPrimitiveFeature> {
    private billboards_: BillboardCollection;
    private points_: PointPrimitiveCollection;
    private primitives_: PrimitiveCollection;

    private layer_: CesiumPrimitiveFeatureLayer;
    private clampToGround_: boolean;

    constructor(config) {
        this.clampToGround_ = config.clampToGround || false;
        this.layer_ = config.layer;

        this.primitives_ = new PrimitiveCollection();
        this.billboards_ = new BillboardCollection({
            scene: config.scene
        });
        this.points_ = new PointPrimitiveCollection({});

        this.primitives_.add(this.billboards_);
        this.primitives_.add(this.points_);
    }

    getPrimitives() {
        return this.primitives_;
    }

    addFeature(id: string, geometry: GeoJSON.Point | GeoJSON.MultiPoint, style: IPointStyle, data: any) {
        const feature: CesiumPointPrimitiveFeature = {
            id: id,
            data: data,
            geometryType: geometry.type,
            geometryRenderer: this,
            style: style,
            renderProps: {
                primitives: []
            }
        };

        const pickInfo: PickInfo = {
            id: id,
            data: data,
            layer: this.layer_,
            pickable: !style.pickingDisabled
        };

        if (geometry.type === 'Point') {
            let primitive;
            if (isIcon(style)) {
                primitive = this.createBillboard_(id, geometry.coordinates, style);
            } else {
                primitive = this.createPoint_(id, geometry.coordinates, style);
            }

            primitive[PICK_INFO_KEY] = pickInfo;

            feature.renderProps.primitives.push(primitive);
        } else if (geometry.type === 'MultiPoint') {
            const points = geometry.coordinates;
            for (let i = 0; i < points.length; ++i) {
                let primitive;
                if (isIcon(style)) {
                    primitive = this.createBillboard_(`${id}_${i}`, points[i], style);
                } else {
                    primitive = this.createPoint_(`${id}_${i}`, points[i], style);
                }

                primitive[PICK_INFO_KEY] = pickInfo;

                feature.renderProps.primitives.push(primitive);
            }
        }

        return feature;
    }

    updateGeometry(feature: CesiumPointPrimitiveFeature, geometry: GeoJSON.Point | GeoJSON.MultiPoint) {
        const primitives = feature.renderProps.primitives;
        const coordinates = geometry.type === 'Point' ? [geometry.coordinates] : geometry.coordinates;

        let i = 0;
        for (i = 0; i < primitives.length; ++i) {
            if (coordinates[i]) this.updatePrimitivedGeometry_(primitives[i], coordinates[i]);
            else {
                this.billboards_.remove(primitives[i] as Billboard);
                this.points_.remove(primitives[i] as PointPrimitive);
            }
        }
        for (let j = i; j < coordinates.length; ++j) {
            let primitive;
            if (isIcon(feature.style)) {
                primitive = this.createBillboard_(`${feature.id}_${i}`, coordinates[j], feature.style);
            } else {
                primitive = this.createPoint_(`${feature.id}_${i}`, coordinates[j], feature.style);
            }

            const pickInfo: PickInfo = {
                id: feature.id,
                data: feature.data,
                layer: this.layer_,
                pickable: !feature.style.pickingDisabled
            };
            primitive[PICK_INFO_KEY] = pickInfo;

            primitives.push(primitive);
        }

        feature.renderProps.primitives = primitives.slice(0, geometry.coordinates.length);
    }

    updateStyle(feature: CesiumPointPrimitiveFeature, style: IPointStyle) {
        feature.renderProps.primitives.forEach((primitive) => {
            if (isIcon(style)) {
                this.updateBillboardStyle_(primitive as Billboard, style);
            } else {
                this.updatePointStyle_(primitive as PointPrimitive, style);
            }
            primitive[PICK_INFO_KEY].pickable = !style.pickingDisabled;
        });
        feature.style = style;
    }

    removeFeature(feature) {
        feature.renderProps.primitives.forEach((primitive) => {
            this.billboards_.remove(primitive);
            this.points_.remove(primitive);
        });
    }

    clear() {
        this.billboards_.removeAll();
        this.points_.removeAll();
    }

    destroy() {
        this.primitives_.destroy();
    }

    protected createBillboard_(id: string, coordinates: GeoJSON.Position, style: IIconStyle) {
        const billboard = this.billboards_.add({
            id: id,
            position: Cartesian3.fromDegrees(...(coordinates as MapCoord)),
            color: style.color ? new Color(...style.color) : undefined,
            show: style.visible,
            image: style.url,
            scale: style.scale || 1.0,
            rotation: style.rotation || 0.0,
            eyeOffset: style.zIndex ? new Cartesian3(0, 0, -100 * style.zIndex) : Cartesian3.ZERO,
            heightReference: this.clampToGround_
                ? coordinates.length === 2
                    ? HeightReference.CLAMP_TO_GROUND
                    : HeightReference.RELATIVE_TO_GROUND
                : HeightReference.NONE
        });

        return billboard;
    }

    protected updateBillboardStyle_(billboard: Billboard, style: IIconStyle) {
        if (style.color) {
            billboard.color = new Color(...style.color);
        }
        billboard.show = style.visible;

        if (style.url) {
            billboard.image = style.url;
        }

        if (style.scale) {
            billboard.scale = style.scale;
        }
        if (style.rotation) {
            billboard.rotation = style.rotation;
        }
        if (style.zIndex) {
            billboard.eyeOffset = new Cartesian3(0, 0, -100 * style.zIndex);
        } else {
            billboard.eyeOffset = Cartesian3.ZERO;
        }
    }

    protected createPoint_(id: string, coordinates: GeoJSON.Position, style: ICircleStyle) {
        return this.points_.add({
            id: id,
            show: style.visible,
            position: Cartesian3.fromDegrees(...(coordinates as MapCoord)),
            pixelSize: style.radius ? style.radius * 2 : 1,
            color: style.fillColor ? new Color(...style.fillColor) : undefined,
            outlineColor: style.strokeColor ? new Color(...style.strokeColor) : undefined
        });
    }

    protected updatePointStyle_(point: PointPrimitive, style: ICircleStyle) {
        point.show = style.visible;

        if (style.fillColor) {
            point.color = new Color(...style.fillColor);
        }
        if (style.strokeColor) {
            point.outlineColor = new Color(...style.strokeColor);
        }

        if (style.radius) {
            point.pixelSize = style.radius * 2;
        } else {
            point.pixelSize = 1;
        }
    }

    protected updatePrimitivedGeometry_(primitive: Billboard | PointPrimitive, coordinates: GeoJSON.Position) {
        primitive.position = Cartesian3.fromDegrees(...(coordinates as MapCoord));
    }
}
