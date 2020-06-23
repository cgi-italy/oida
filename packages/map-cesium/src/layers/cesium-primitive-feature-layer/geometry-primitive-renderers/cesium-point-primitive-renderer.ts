import PrimitiveCollection from 'cesium/Source/Scene/PrimitiveCollection';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';
import HeightReference from 'cesium/Source/Scene/HeightReference';
import BillboardCollection from 'cesium/Source/Scene/BillboardCollection';
import PointPrimitiveCollection  from 'cesium/Source/Scene/PointPrimitiveCollection';

import { IPointStyle, isIcon } from '@oida/core';

import { CesiumGeometryPrimitiveRenderer } from './cesium-geometry-primitive-renderer';

export class CesiumPointPrimitiveRenderer implements CesiumGeometryPrimitiveRenderer {
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

    addFeature(id, geometry, style: IPointStyle) {

        let feature: any = null;

        if (geometry.type === 'Point') {
            if (isIcon(style)) {
                feature = this.createBillboard_(id, geometry.coordinates, style);
            } else {
                feature = this.createPoint_(id, geometry.coordinates, style);
            }

            feature.entityId_ = id;
            feature.pickingDisabled_ = style.pickingDisabled || false;
            feature.pickCallbacks_ = this.pickCallbacks_;

        } else if (geometry.type === 'MultiPoint') {
            feature = [];
            let points = geometry.coordinates;
            for (let i = 0; i < points.length; ++i) {
                let pointFeature;
                if (isIcon(style)) {
                    pointFeature = this.createBillboard_(`${id}_${i}`, points[i], style);
                } else {
                    pointFeature = this.createPoint_(`${id}_${i}`, points[i], style);
                }

                pointFeature.entityId_ = id;
                pointFeature.pickingDisabled_ = style.pickingDisabled || false;
                pointFeature.pickCallbacks_ = this.pickCallbacks_;

                feature.push(pointFeature);
            }

            feature.id = id;
            feature.style = style;
        }

        return feature;
    }

    updateGeometry(feature, geometry) {
        if (this.isMultiPoint_(feature)) {
            let i = 0;
            for (i = 0; i < feature.length; ++i) {
                if (geometry.coordinates[i])
                    this.updateBillboardGeometry_(feature[i], geometry.coordinates[i]);
                else {
                    this.billboards_.remove(feature[i]);
                    this.points_.remove(feature[i]);
                }
            }
            for (let j = i; j < geometry.coordinates.length; ++j) {
                let pointFeature;
                if (isIcon(feature.style)) {
                    pointFeature = this.createBillboard_(`${feature.id}_${i}`, geometry.coordinates[j], feature.style);
                } else {
                    pointFeature = this.createPoint_(`${feature.id}_${i}`, geometry.coordinates[j], feature.style);
                }

                pointFeature.entityId_ = feature.id;
                pointFeature.pickingDisabled_ = feature.style.pickingDisabled || false;
                pointFeature.pickCallbacks_ = this.pickCallbacks_;

                feature.push(pointFeature);
            }
        } else {
            this.updateBillboardGeometry_(feature, geometry.coordinates);
        }
    }

    updateStyle(feature, style) {
        if (this.isMultiPoint_(feature)) {
            for (let point of feature) {
                if (isIcon(style)) {
                    this.updateBillboardStyle_(point, style);
                } else {
                    this.updatePointStyle_(point, style);
                }
            }
            feature.style = style;
        } else {
            if (isIcon(style)) {
                this.updateBillboardStyle_(feature, style);
            } else {
                this.updatePointStyle_(feature, style);
            }
        }
    }

    removeFeature(feature) {
        if (this.isMultiPoint_(feature)) {
            for (let point of feature) {
                this.billboards_.remove(point);
                this.points_.remove(point);
            }
        } else {
            this.billboards_.remove(feature);
            this.points_.remove(feature);
        }
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

    protected updateBillboardGeometry_(billboard, coordinates) {
        billboard.position = Cartesian3.fromDegrees(...coordinates);
    }

    protected updateBillboardStyle_(billboard, style) {
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

    protected createPoint_(id, coordinates, style) {
        return this.points_.add({
            id: id,
            show: style.visible,
            position: Cartesian3.fromDegrees(...coordinates),
            pixelSize: style.radius ? style.radius * 2 : 1,
            color: style.fillColor ? new Color(...style.fillColor) : undefined,
            outlineColor: style.strokeColor ? new Color(...style.strokeColor) : undefined
        });
    }

    protected updatePointStyle_(point, style) {

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

    protected isMultiPoint_(feature) {
        return Array.isArray(feature);
    }

}
