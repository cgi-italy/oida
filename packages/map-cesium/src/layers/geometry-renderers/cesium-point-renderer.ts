import PrimitiveCollection from 'cesium/Source/Scene/PrimitiveCollection';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';
import HeightReference from 'cesium/Source/Scene/HeightReference';
import BillboardCollection from 'cesium/Source/Scene/BillboardCollection';
import PointPrimitiveCollection  from 'cesium/Source/Scene/PointPrimitiveCollection';
import { CesiumGeometryRenderer } from './cesium-geometry-renderer';

export class CesiumPointRenderer implements CesiumGeometryRenderer {
    private billboards_: BillboardCollection;
    private points_: PointPrimitiveCollection;
    private primitives_: PrimitiveCollection;

    private clampToGround_: boolean = false;

    constructor(config) {

        this.clampToGround_ = config.clampToGround || false;

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

    addFeature(id, geometry, style) {

        let feature: any = null;

        if (geometry.type === 'Point') {
            feature = this.createBillboard_(id, geometry.coordinates, style);
        } else if (geometry.type === 'MultiPoint') {
            feature = [];
            let points = geometry.coordinates;
            for (let i = 0; i < geometry.coordinates.length; ++i) {
                let pointFeature = this.createBillboard_(`${id}_${i}`, geometry.coordinates[i], style);
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
                }
            }
            for (let j = i; j < geometry.coordinates.length; ++j) {
                feature.push(this.createBillboard_(`${feature.id}_${i}`, geometry.coordinates[j], feature.style));
            }
        } else {
            this.updateBillboardGeometry_(feature, geometry.coordinates);
        }
    }

    updateStyle(feature, style) {
        if (this.isMultiPoint_(feature)) {
            for (let point of feature) {
                this.updateBillboardStyle_(point, style);
            }
        } else {
            this.updateBillboardStyle_(feature, style);
        }
    }

    removeFeature(feature) {
        if (this.isMultiPoint_(feature)) {
            for (let point of feature) {
                this.billboards_.remove(point);
            }
        } else {
            this.billboards_.remove(feature);
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
    }

    protected isMultiPoint_(feature) {
        return Array.isArray(feature);
    }

}
