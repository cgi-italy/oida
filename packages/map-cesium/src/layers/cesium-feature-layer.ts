import { CesiumMapLayer } from './cesium-map-layer';
import { cesiumLayersFactory } from './cesium-layers-factory';

import { FEATURE_LAYER_ID, IFeatureLayerRenderer, IFeatureStyle } from '@oida/core';

import { CesiumGeometryRenderer, CesiumPointRenderer, CesiumLineRenderer, CesiumPolygonRenderer } from './geometry-renderers';

export class CesiumFeatureLayer extends CesiumMapLayer implements IFeatureLayerRenderer {

    protected featureMap_ = {};

    protected pointRenderer_;
    protected lineRenderer_;
    protected polygonRenderer_;

    protected clampToGround_: boolean = false;


    constructor(config) {
        super(config);

        this.clampToGround_ = config.clampToGround || false;
    }

    addFeature(id, geometry, style) {

        let geometryRenderer = this.getOrCreateGeometryRenderer_(geometry.type);

        if (geometryRenderer) {
            let feature = geometryRenderer.addFeature(id, geometry, this.getStyleForGeometry_(style, geometry.type));
            feature.geometryRenderer = geometryRenderer;
            feature.geometryType = geometry.type;

            this.featureMap_[id] = feature;

            this.mapRenderer_.getViewer().scene.requestRender();

            return feature;
        }

    }

    updateFeatureGeometry(id, geometry) {

        let feature = this.getFeature(id);
        if (feature) {
            let geometryRenderer = this.getOrCreateGeometryRenderer_(geometry.type);
            if (geometryRenderer === feature.geometryRenderer) {
                geometryRenderer.updateGeometry(feature, geometry);
                this.mapRenderer_.getViewer().scene.requestRender();
            } else {
                throw 'Feature geometry must be of the same class';
            }
        }
    }

    updateFeatureStyle(id, style) {

        let feature = this.getFeature(id);
        if (feature) {
            feature.geometryRenderer.updateStyle(feature, this.getStyleForGeometry_(style, feature.geometryType));
            this.mapRenderer_.getViewer().scene.requestRender();
        }
    }


    removeFeature(id) {

        let feature = this.getFeature(id);

        if (feature) {
            feature.geometryRenderer.removeFeature(feature);
            this.mapRenderer_.getViewer().scene.requestRender();
        }

        delete this.featureMap_[id];
    }

    removeAllFeatures() {
        this.pointRenderer_.clear();
        this.lineRenderer_.clear();
        this.polygonRenderer_.clear();

        this.featureMap_ = {};

        this.mapRenderer_.getViewer().scene.requestRender();
    }

    getFeature(id) {
        return this.featureMap_[id];
    }

    destroy() {
        super.destroy();
        if (this.pointRenderer_) {
            this.pointRenderer_.destroy();
            delete this.pointRenderer_;
        }
        if (this.lineRenderer_) {
            this.lineRenderer_.destroy();
            delete this.lineRenderer_;
        }
        if (this.polygonRenderer_) {
            this.polygonRenderer_.destroy();
            delete this.polygonRenderer_;
        }
    }

    protected getStyleForGeometry_(style: IFeatureStyle, geometryType: GeoJSON.GeoJsonGeometryTypes) {

        let geometryStyle;

        switch (geometryType) {
            case 'Point':
            case 'MultiPoint':
                geometryStyle = style.point;
                break;
            case 'LineString':
            case 'MultiLineString':
                geometryStyle = style.line;
                break;
            case 'Polygon':
            case 'MultiPolygon':
                geometryStyle = style.polygon;
                break;
        }

        return geometryStyle;
    }

    protected getOrCreateGeometryRenderer_(geometryType: GeoJSON.GeoJsonGeometryTypes) {

        let geometryRenderer;

        switch (geometryType) {
            case 'Point':
            case 'MultiPoint':
                if (!this.pointRenderer_) {
                    this.pointRenderer_ = new CesiumPointRenderer({
                        scene: this.mapRenderer_.getViewer().scene,
                        clampToGround: this.clampToGround_
                    });
                    this.primitives_.add(this.pointRenderer_.getPrimitives());
                }
                geometryRenderer = this.pointRenderer_;
                break;
            case 'LineString':
            case 'MultiLineString':
                if (!this.lineRenderer_) {
                    this.lineRenderer_ = new CesiumLineRenderer({
                        clampToGround: this.clampToGround_
                    });
                    this.primitives_.add(this.lineRenderer_.getPrimitives());
                }
                geometryRenderer = this.lineRenderer_;
                break;
            case 'Polygon':
            case 'MultiPolygon':
                if (!this.polygonRenderer_) {
                    this.polygonRenderer_ = new CesiumPolygonRenderer({
                        clampToGround: this.clampToGround_
                    });
                    this.primitives_.add(this.polygonRenderer_.getPrimitives());
                }
                geometryRenderer = this.polygonRenderer_;
                break;
        }

        return geometryRenderer;
    }
}

cesiumLayersFactory.register(FEATURE_LAYER_ID, (config) => {
    return new CesiumFeatureLayer(config);
});
