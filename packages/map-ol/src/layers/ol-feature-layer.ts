import VectorSource from 'ol/source/Vector';
import ClusterSource from 'ol/source/Cluster';
import VectorLayer from 'ol/layer/Vector';
import VectorImageLayer from 'ol/layer/VectorImage';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Circle from 'ol/geom/Circle';
import { StyleFunction } from 'ol/style/Style';
import { transform } from 'ol/proj';
import EventType from 'ol/events/EventType';
import bboxPolygon from '@turf/bbox-polygon';

import { FeatureLayerRendererConfig, FEATURE_LAYER_ID, Geometry, IFeature, IFeatureLayerRenderer, IFeatureStyle } from '@oidajs/core';

import { OLMapLayer } from './ol-map-layer';
import { olLayersFactory } from './ol-layers-factory';
import { OLStyleParser } from '../utils/ol-style-parser';

export type OLFeatureLayerProps = {
    /** set this flag to improve performance when rendering an high number of vertices */
    useImageRenderer?: boolean;
};

export class OLFeatureLayer extends OLMapLayer<VectorLayer<VectorSource>> implements IFeatureLayerRenderer {
    static readonly FEATURE_DATA_KEY = 'data';
    static readonly FEATURE_LAYER_KEY = 'layer';
    static readonly FEATURE_PICKING_DISABLED_KEY = 'pickingDisabled';

    protected geomParser_: GeoJSON;
    protected styleParser_: OLStyleParser;
    protected onFeatureHover_: ((feature: IFeature<any>, coordinate: GeoJSON.Position) => void) | undefined;
    protected onFeatureSelect_: ((feature: IFeature<any>, coordinate: GeoJSON.Position) => void) | undefined;
    protected vectorSource_!: VectorSource;
    protected clusterRecomputeTimeout_: number | undefined;

    constructor(config: FeatureLayerRendererConfig & OLFeatureLayerProps) {
        super(config);
        this.geomParser_ = new GeoJSON();
        this.styleParser_ = new OLStyleParser();
        this.onFeatureHover_ = config.onFeatureHover;
        this.onFeatureSelect_ = config.onFeatureSelect;
    }

    addFeature(id: string, geometry: Geometry, style: IFeatureStyle, data: any) {
        const geom = this.parseGeometry_(geometry);

        if (geom) {
            const feature = new Feature({
                geometry: geom
            });

            const featureStyle = this.styleParser_.getStyleForGeometry(geometry.type, style);

            feature.setStyle(featureStyle);
            feature.setId(id);
            if (featureStyle) {
                feature.set(OLFeatureLayer.FEATURE_PICKING_DISABLED_KEY, featureStyle.pickingDisabled);
            }
            if (data) {
                feature.set(OLFeatureLayer.FEATURE_DATA_KEY, data);
            }
            feature.set(OLFeatureLayer.FEATURE_LAYER_KEY, this);

            this.delayClusterRecomputation_();
            this.vectorSource_.addFeature(feature);
            return {
                id: id,
                data: data,
                olFeature: feature
            };
        }
    }

    getFeature(id) {
        return this.vectorSource_.getFeatureById(id);
    }

    hasFeature(id: string) {
        return !!this.vectorSource_.getFeatureById(id);
    }

    getFeatureData(id: string) {
        const feature = this.getFeature(id);
        if (feature) {
            return feature.get(OLFeatureLayer.FEATURE_DATA_KEY);
        }
    }

    updateFeatureGeometry(id: string, geometry: Geometry) {
        const feature = this.getFeature(id);
        if (feature) {
            this.delayClusterRecomputation_();
            feature.setGeometry(this.parseGeometry_(geometry));
        }
    }

    updateFeatureStyle(id: string, style: IFeatureStyle) {
        const feature = this.getFeature(id);
        if (feature) {
            const geometry = feature.getGeometry();
            if (geometry) {
                this.delayClusterRecomputation_(true);
                const featureStyle = this.styleParser_.getStyleForGeometry(geometry.getType(), style);
                feature.setStyle(featureStyle);
                if (featureStyle) {
                    feature.set(OLFeatureLayer.FEATURE_PICKING_DISABLED_KEY, featureStyle.pickingDisabled);
                }
            }
        }
    }

    removeFeature(id: string) {
        const feature = this.getFeature(id);
        if (feature) {
            this.delayClusterRecomputation_();
            this.vectorSource_.removeFeature(feature);
        }
    }

    removeAllFeatures() {
        this.vectorSource_.clear(true);
    }

    shouldReceiveFeatureHoverEvents() {
        return !!this.onFeatureHover_;
    }

    shouldReceiveFeatureSelectEvents() {
        return !!this.onFeatureSelect_;
    }

    onFeatureHover(coordinate: GeoJSON.Position, feature: IFeature) {
        this.onFeatureHover_!(feature, coordinate);
    }

    onFeatureSelect(coordinate: GeoJSON.Position, feature: IFeature) {
        this.onFeatureSelect_!(feature, coordinate);
    }

    protected parseGeometry_(geometry) {
        if (!geometry || !geometry.type) {
            return;
        }

        if (geometry.type === 'Circle') {
            let center = geometry.center;
            const mapProjection = this.mapRenderer_.getViewer().getView().getProjection();
            if (mapProjection.getCode() !== 'EPSG:4326') {
                center = transform(center, 'EPSG:4326', mapProjection);
                if (isNaN(center[0]) || isNaN(center[1])) {
                    return;
                }
            }
            return new Circle(center, geometry.radius);
        }

        if (geometry.type === 'BBox') {
            geometry = bboxPolygon(geometry.bbox).geometry;
        }

        return this.geomParser_.readGeometry(geometry, {
            dataProjection: 'EPSG:4326',
            featureProjection: this.mapRenderer_.getViewer().getView().getProjection()
        });
    }

    protected createOLObject_(config: FeatureLayerRendererConfig & OLFeatureLayerProps) {
        let source = new VectorSource({
            wrapX: this.mapRenderer_.getViewer().getView()['wrapX']
        });

        let style: StyleFunction = () => {
            return;
        };

        this.vectorSource_ = source;

        const clustering = config.clustering;
        if (clustering?.enabled) {
            source = new ClusterSource({
                wrapX: this.mapRenderer_.getViewer().getView()['wrapX'],
                distance: config.clustering?.distance,
                source: this.vectorSource_
            });

            style = (feature) => {
                const features = feature.get('features');
                if (features.length > 1) {
                    const clusterStyle = clustering.style(features.map((feature) => feature.get(OLFeatureLayer.FEATURE_DATA_KEY)));
                    return this.styleParser_.getStyleForGeometry('Point', clusterStyle);
                } else {
                    return features[0].getStyle();
                }
            };
        }

        const VectorLayerRenderer = config.useImageRenderer ? VectorImageLayer : VectorLayer;
        return new VectorLayerRenderer({
            source: source,
            extent: config.extent,
            zIndex: config.zIndex || 0,
            style: style,
            declutter: true // enable label decluterring
        });
    }

    protected destroyOLObject_() {
        this.olImpl_.dispose();
    }

    /**
     * Delay clusters recomputation (automatically called after a feature add/remove/update)
     * Usefull when multiple operations are done in a loop, to prevent
     * useless work
     * @param preventRefresh disable cluster recomputation
     */
    protected delayClusterRecomputation_(preventRefresh = false) {
        const clusterSsource = this.olImpl_.getSource();
        if (clusterSsource instanceof ClusterSource) {
            if (this.clusterRecomputeTimeout_) {
                clearTimeout(this.clusterRecomputeTimeout_);
            }
            // temporary remove the source change event listener
            this.vectorSource_.removeEventListener(EventType.CHANGE, clusterSsource['boundRefresh_']);
            this.clusterRecomputeTimeout_ = setTimeout(() => {
                this.vectorSource_.addEventListener(EventType.CHANGE, clusterSsource['boundRefresh_']);
                if (!preventRefresh) {
                    clusterSsource.refresh();
                } else {
                    this.olImpl_.changed();
                }
                delete this.clusterRecomputeTimeout_;
            });
        }
    }
}

olLayersFactory.register(FEATURE_LAYER_ID, (config) => {
    return new OLFeatureLayer(config);
});
