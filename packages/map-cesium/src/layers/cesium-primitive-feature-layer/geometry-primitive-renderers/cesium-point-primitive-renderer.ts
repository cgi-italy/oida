import PrimitiveCollection from 'cesium/Source/Scene/PrimitiveCollection';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';
import HeightReference from 'cesium/Source/Scene/HeightReference';
import BillboardCollection from 'cesium/Source/Scene/BillboardCollection';
import PointPrimitiveCollection  from 'cesium/Source/Scene/PointPrimitiveCollection';
import Billboard from 'cesium/Source/Scene/Billboard';
import PointPrimitive from 'cesium/Source/Scene/PointPrimitive';

import { IPointStyle, IIconStyle, ICircleStyle, isIcon } from '@oida/core';

import { CesiumGeometryPrimitiveFeature, CesiumGeometryPrimitiveRenderer } from './cesium-geometry-primitive-renderer';

export type CesiumPointPrimitiveRenderProps = {
    primitives: (Billboard | PointPrimitive)[];
};

export type CesiumPointPrimitiveFeature = CesiumGeometryPrimitiveFeature<CesiumPointPrimitiveRenderProps, IPointStyle>;

export class CesiumPointPrimitiveRenderer implements CesiumGeometryPrimitiveRenderer<CesiumPointPrimitiveFeature> {
    private billboards_: BillboardCollection;
    private points_: PointPrimitiveCollection;
    private primitives_: PrimitiveCollection;

    private clampToGround_: boolean = false;
    private pickCallbacks_;

    constructor(config) {

        this.clampToGround_ = config.clampToGround || false;
        this.pickCallbacks_ = config.pickCallbacks;

        this.primitives_ = new PrimitiveCollection();
        this.billboards_ = new BillboardCollection({
            scene: config.scene
        });
        this.points_ = new PointPrimitiveCollection({

        });

        this.primitives_.add(this.billboards_);
        this.primitives_.add(this.points_);
    }

    getPrimitives() {
        return this.primitives_;
    }

    addFeature(id: string, geometry: GeoJSON.Point | GeoJSON.MultiPoint, style: IPointStyle, data: any) {

        let feature: CesiumPointPrimitiveFeature = {
            id: id,
            data: data,
            geometryType: geometry.type,
            geometryRenderer: this,
            style: style,
            renderProps: {
                primitives: []
            }
        };

        if (geometry.type === 'Point') {
            let primitive;
            if (isIcon(style)) {
                primitive = this.createBillboard_(id, geometry.coordinates, style);
            } else {
                primitive = this.createPoint_(id, geometry.coordinates, style);
            }

            primitive.entityId_ = id;
            primitive.pickingDisabled_ = style.pickingDisabled || false;
            primitive.pickCallbacks_ = this.pickCallbacks_;
            primitive.data_ = data;
            primitive.feature_ = feature;

            feature.renderProps.primitives.push(primitive);

        } else if (geometry.type === 'MultiPoint') {
            let points = geometry.coordinates;
            for (let i = 0; i < points.length; ++i) {
                let primitive;
                if (isIcon(style)) {
                    primitive = this.createBillboard_(`${id}_${i}`, points[i], style);
                } else {
                    primitive = this.createPoint_(`${id}_${i}`, points[i], style);
                }

                primitive.entityId_ = id;
                primitive.pickingDisabled_ = style.pickingDisabled || false;
                primitive.pickCallbacks_ = this.pickCallbacks_;
                primitive.data_ = data;
                primitive.feature_ = feature;

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
            if (coordinates[i])
                this.updatePrimitivedGeometry_(primitives[i], coordinates[i]);
            else {
                this.billboards_.remove(primitives[i]);
                this.points_.remove(primitives[i]);
            }
        }
        for (let j = i; j < coordinates.length; ++j) {
            let primitive;
            if (isIcon(feature.style)) {
                primitive = this.createBillboard_(`${feature.id}_${i}`, coordinates[j], feature.style);
            } else {
                primitive = this.createPoint_(`${feature.id}_${i}`, coordinates[j], feature.style);
            }

            primitive.entityId_ = feature.id;
            primitive.pickingDisabled_ = feature.style.pickingDisabled || false;
            primitive.pickCallbacks_ = this.pickCallbacks_;
            primitive.data_ = feature.data;
            primitive.feature_ = feature;

            primitives.push(primitive);
        }

        feature.renderProps.primitives = primitives.slice(0, geometry.coordinates.length);
    }

    updateStyle(feature: CesiumPointPrimitiveFeature, style: IPointStyle) {
        feature.renderProps.primitives.forEach((primitive) => {
            if (isIcon(style)) {
                this.updateBillboardStyle_(primitive, style);
            } else {
                this.updatePointStyle_(primitive, style);
            }
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

    protected createBillboard_(id, coordinates, style) {
        let billboard = this.billboards_.add({
            id: id,
            position: Cartesian3.fromDegrees(...coordinates),
            color: style.color ? new Color(...style.color) : undefined,
            show: style.visible,
            image: style.url,
            scale: style.scale || 1.0,
            rotation: style.rotation || 0.0,
            eyeOffset: style.zIndex ? new Cartesian3(0, 0, -100 * style.zIndex) : Cartesian3.ZERO,
            heightReference:
                this.clampToGround_ ? (coordinates.length === 2 ? HeightReference.CLAMP_TO_GROUND
                                                                : HeightReference.RELATIVE_TO_GROUND)
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

        billboard.pickingDisabled_ = style.pickingDisabled || false;
    }

    protected createPoint_(id: string, coordinates: GeoJSON.Position, style: ICircleStyle) {
        return this.points_.add({
            id: id,
            show: style.visible,
            position: Cartesian3.fromDegrees(...coordinates),
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

        point.pickingDisabled_ = style.pickingDisabled || false;

    }

    protected updatePrimitivedGeometry_(primitive: Billboard | PointPrimitive, coordinates: GeoJSON.Position) {
        primitive.position = Cartesian3.fromDegrees(...coordinates);
    }

}
