import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';
import Material from 'cesium/Source/Scene/Material';
import PolylineCollection from 'cesium/Source/Scene/PolylineCollection';

import { CesiumGeometryRenderer } from './cesium-geometry-renderer';

export class CesiumLineRenderer implements CesiumGeometryRenderer {

    protected polylines_: PolylineCollection;
    protected clampToGround_: boolean = false;

    constructor(config) {
        this.clampToGround_ = config.clampToGround || false;
        this.polylines_ = new PolylineCollection();
    }

    getPrimitives() {
        return this.polylines_;
    }

    addFeature(id, geometry, style) {
        let feature = null;
        if (geometry.type === 'LineString') {
            feature = this.createPolyline_(id, geometry.coordinates, style);
        } else if (geometry.type === 'MultiLineString') {
            feature = [];
            let points = geometry.coordinates;
            for (let i = 0; i < geometry.coordinates.length; ++i) {
                let point_feature = this.createPolyline_(`${id}_${i}`, geometry.coordinates[i], style);
                feature.push(point_feature);
            }

            feature.id = id;
        }

        feature.style = style;

        return feature;
    }


    updateGeometry(feature, geometry) {
        if (this.isMultiLine_(feature)) {
            let i = 0;
            for (i = 0; i < feature.length; ++i) {
                if (geometry.coordinates[i])
                    this.updatePolylineGeometry_(feature[i], geometry.coordinates[i]);
                else {
                    this.polylines_.remove(feature[i]);
                }
            }
            for (let j = i; j < geometry.coordinates.length; ++j) {
                feature.push(this.createPolyline_(`${feature.id}_${i}`, geometry.coordinates[j], feature.style));
            }
        } else {
            this.updatePolylineGeometry_(feature, geometry.coordinates);
        }
    }

    updateStyle(feature, style) {
        if (this.isMultiLine_(feature)) {
            for (let line of feature) {
                this.updatePolylineStyle_(line, style);
            }
        } else {
            this.updatePolylineStyle_(feature, style);
        }

        feature.style = style;
    }

    removeFeature(feature) {
        if (this.isMultiLine_(feature)) {
            for (let line of feature) {
                this.polylines_.remove(line);
            }
        } else {
            this.polylines_.remove(feature);
        }
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


    protected createPolyline_(id, coordinates, style) {
        let polyline = this.polylines_.add({
            id: id,
            positions: Cartesian3.fromDegreesArray([].concat(...coordinates)),
            width: style.width || 1,
            show: style.visible,
            material: new Material({
                fabric: {
                    type: 'Color',
                    uniforms: {
                        color: new Color(...style.color)
                    }
                }
            })
        });

        return polyline;
    }

    protected updatePolylineStyle_(polyline, style) {
        polyline.material.uniforms.color = new Color(...style.color);
        polyline.show = style.visible;
        polyline.width = style.width;
    }

    protected updatePolylineGeometry_(polyline, coordinates) {
        polyline.positions = Cartesian3.fromDegreesArray([].concat(...coordinates));
    }

}

