import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Circle from 'ol/geom/Circle';
import { transform } from 'ol/proj';

import bboxPolygon from '@turf/bbox-polygon';

import { FEATURE_LAYER_ID, IFeatureLayerRenderer } from '@oida/core';

import { OLMapLayer } from './ol-map-layer';
import { olLayersFactory } from './ol-layers-factory';
import { OLStyleParser } from '../utils/ol-style-parser';

export class OLFeatureLayer extends OLMapLayer<VectorLayer> implements IFeatureLayerRenderer {

    static readonly FEATURE_DATA_KEY = 'data';
    static readonly FEATURE_PICKING_DISABLED_KEY = 'pickingDisabled';

    protected geomParser_;
    protected styleParser_;

    constructor(config) {
        super(config);
        this.geomParser_ = new GeoJSON();
        this.styleParser_ = new OLStyleParser();
    }


    addFeature(id, geometry, style, data) {

        let geom = this.parseGeometry_(geometry);

        if (geom) {
            let feature = new Feature({
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
            this.olImpl_.getSource().addFeature(feature);
            return feature;
        }
    }

    getFeature(id) {
        return this.olImpl_.getSource().getFeatureById(id);
    }

    hasFeature(id: string) {
        return !!this.olImpl_.getSource().getFeatureById(id);
    }

    getFeatureData(id: string) {
        let feature = this.getFeature(id);
        if (feature) {
            return feature.get(OLFeatureLayer.FEATURE_DATA_KEY);
        }
    }

    updateFeatureGeometry(id, geometry) {
        let feature = this.getFeature(id);
        if (feature) {
            feature.setGeometry(this.parseGeometry_(geometry));
        }
    }

    updateFeatureStyle(id, style) {
        let feature = this.getFeature(id);
        if (feature) {
            const featureStyle = this.styleParser_.getStyleForGeometry(feature.getGeometry().getType(), style);
            feature.setStyle(featureStyle);
            if (featureStyle) {
                feature.set(OLFeatureLayer.FEATURE_PICKING_DISABLED_KEY, featureStyle.pickingDisabled);
            }
        }
    }

    removeFeature(id) {
        let feature = this.getFeature(id);
        if (feature) {
            this.olImpl_.getSource().removeFeature(feature);
        }
    }


    removeAllFeatures() {
        this.olImpl_.getSource().clear(true);
    }

    protected parseGeometry_(geometry) {

        if (!geometry || !geometry.type) {
            return;
        }

        if (geometry.type === 'Circle') {
            let center = geometry.center;
            let mapProjection = this.mapRenderer_.getViewer().getView().getProjection();
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

        return this.geomParser_.readGeometryFromObject(geometry, {
            dataProjection: 'EPSG:4326',
            featureProjection: this.mapRenderer_.getViewer().getView().getProjection()
        });
    }

    protected createOLObject_(config) {
        let source = new VectorSource({
            wrapX: this.mapRenderer_.getViewer().getView().wrapX
        });

        return new VectorLayer({
            source: source,
            extent: config.extent,
            zIndex: config.zIndex || 0,
            style: () => {
                return null;
            }
        });
    }

    protected destroyOLObject_() {
        this.olImpl_.dispose();
    }

}

olLayersFactory.register(FEATURE_LAYER_ID, (config) => {
    return new OLFeatureLayer(config);
});
