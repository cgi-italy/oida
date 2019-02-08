import DrawInteraction from 'ol/interaction/Draw';
import Polygon from 'ol/geom/Polygon';
import LineString from 'ol/geom/LineString';
import MultiLineString from 'ol/geom/MultiLineString';
import GeoJSON from 'ol/format/GeoJSON';

import { createBox } from 'ol/interaction/Draw';

import {
    IFeatureDrawInteractionProps,
    FEATURE_DRAW_INTERACTION_ID,
    IFeatureDrawInteractionImplementation,
    FeatureDrawMode,
    FeatureDrawOptions
} from '@oida/core';

import { OLMapRenderer } from '../map/ol-map-renderer';
import { olInteractionsFactory } from './ol-interactions-factory';

export class OLFeatureDrawInteraction implements IFeatureDrawInteractionImplementation {

    private viewer_;
    private olInteraction_;
    private geoJsonParser_;

    constructor(props: IFeatureDrawInteractionProps<OLMapRenderer>) {
        this.viewer_ = props.mapRenderer.getViewer();
        this.geoJsonParser_ = new GeoJSON();
    }

    setActive(active) {
        if (this.olInteraction_) {
            this.viewer_.olInteraction_.setActive(active);
        }
    }

    setDrawMode(mode: FeatureDrawMode, options: FeatureDrawOptions) {
        if (this.olInteraction_) {
            this.viewer_.removeInteraction(this.olInteraction_);
            delete this.olInteraction_;
        }

        if (mode === FeatureDrawMode.Point) {
            this.olInteraction_ = new DrawInteraction({
                type: 'Point'
            });
        }
        if (mode === FeatureDrawMode.Line) {
            this.olInteraction_ = new DrawInteraction({
                type: 'LineString'
            });
        } else if (mode === FeatureDrawMode.BBox) {
            this.olInteraction_ = new DrawInteraction({
                type: 'Circle',
                geometryFunction: createBox()
            });
        } else if (mode === FeatureDrawMode.Polygon) {
            this.olInteraction_ = new DrawInteraction({
                type: 'LineString',
                geometryFunction: (coordinates, geometry) => {
                    geometry = geometry || new LineString([]);
                    geometry.setCoordinates([...coordinates, coordinates[0]]);
                    return geometry;
                }
            });
        } else if (mode === FeatureDrawMode.Circle) {
            this.olInteraction_ = new DrawInteraction({
                type: 'Circle'
            });
        }

        if (this.olInteraction_) {
            this.viewer_.addInteraction(this.olInteraction_);

            if (options.onDrawStart || options.onDrawChange) {
                this.olInteraction_.on('drawstart', (evt) => {

                    if (options.onDrawChange) {
                        evt.feature.getGeometry().on('change', (evt) => {
                            options.onDrawChange(evt);
                        });
                    }
                    if (options.onDrawStart) {
                        options.onDrawStart(evt);
                    }
                });
            }

            if (options.onDrawEnd) {
                this.olInteraction_.on('drawend', (evt) => {
                    setTimeout(() => {
                        options.onDrawEnd({
                            geometry: this.getGeoJSONGeometry(mode, evt.feature.getGeometry())
                        });
                    }, 0);
                });
            }
        }
    }

    destroy() {
        if (this.olInteraction_) {
            this.viewer_.removeInteraction(this.olInteraction_);
            delete this.olInteraction_;
        }
    }

    protected getGeoJSONGeometry(mode, geometry) {
        if (mode === FeatureDrawMode.Polygon) {
            geometry = new Polygon([geometry.getCoordinates()]);
        }
        return this.geoJsonParser_.writeGeometryObject(geometry, {
            featureProjection: this.viewer_.getView().getProjection()
        });
    }

}


olInteractionsFactory.register(FEATURE_DRAW_INTERACTION_ID, (config) => {
    return new OLFeatureDrawInteraction(config);
});
