import DrawInteraction from 'ol/interaction/Draw';
import Polygon from 'ol/geom/Polygon';
import LineString from 'ol/geom/LineString';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';

import { createBox } from 'ol/interaction/Draw';

import { transform, transformExtent } from 'ol/proj';

import {
    IFeatureDrawInteractionProps,
    FEATURE_DRAW_INTERACTION_ID,
    IFeatureDrawInteractionImplementation,
    FeatureDrawMode,
    FeatureDrawOptions
} from '@oidajs/core';

import { OLMapRenderer } from '../map/ol-map-renderer';
import { olInteractionsFactory } from './ol-interactions-factory';

export class OLFeatureDrawInteraction implements IFeatureDrawInteractionImplementation {
    private viewer_: Map;
    private olInteraction_: DrawInteraction | undefined;
    private geoJsonParser_: GeoJSON;

    constructor(props: IFeatureDrawInteractionProps<OLMapRenderer>) {
        this.viewer_ = props.mapRenderer.getViewer();
        this.geoJsonParser_ = new GeoJSON();
    }

    setActive(active) {
        if (this.olInteraction_) {
            this.olInteraction_.setActive(active);
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
                type: 'LineString',
                minPoints: options.minCoords,
                maxPoints: options.maxCoords
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
                },
                minPoints: options.minCoords,
                maxPoints: options.maxCoords
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
                        const geometry = evt.feature.getGeometry();
                        if (geometry) {
                            geometry.on('change', (evt) => {
                                options.onDrawChange!({
                                    geometry: geometry
                                });
                            });
                        }
                    }
                    if (options.onDrawStart) {
                        options.onDrawStart({
                            geometry: evt.feature.getGeometry()
                        });
                    }
                });
            }

            if (options.onDrawEnd) {
                this.olInteraction_.on('drawend', (evt) => {
                    setTimeout(
                        () =>
                            options.onDrawEnd!({
                                geometry: this.getGeoJSONGeometry(mode, evt.feature.getGeometry())
                            }),
                        0
                    );
                });
            }
        }
    }

    destroy() {
        if (this.olInteraction_) {
            this.viewer_.removeInteraction(this.olInteraction_);
            this.olInteraction_.dispose();
            delete this.olInteraction_;
        }
    }

    protected getGeoJSONGeometry(mode, geometry) {
        if (mode === FeatureDrawMode.BBox) {
            let extent = geometry.getExtent();
            const projection = this.viewer_.getView().getProjection();
            if (projection.getCode() !== 'EPSG:4326') {
                extent = transformExtent(extent, projection, 'EPSG:4326');
                if (isNaN(extent[0]) || isNaN(extent[1]) || isNaN(extent[2]) || isNaN(extent[3])) {
                    return null;
                }
            }
            return {
                type: 'BBox',
                bbox: extent
            };
        } else if (mode === FeatureDrawMode.Circle) {
            let center = geometry.getCenter();
            const projection = this.viewer_.getView().getProjection();
            if (projection.getCode() !== 'EPSG:4326') {
                center = transform(center, projection, 'EPSG:4326');
            }

            return {
                type: 'Circle',
                center: center,
                radius: geometry.getRadius()
            };
        }

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
