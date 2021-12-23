import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Cartographic from 'cesium/Source/Core/Cartographic';
import CesiumMath from 'cesium/Source/Core/Math';

import { IFeatureLayerRenderer, IFeatureStyle, FeatureLayerRendererConfig, FeatureGeometry, IFeature } from '@oidajs/core';

import { CesiumFeatureCoordPickMode, PickInfo } from '../../utils/picking';
import { CesiumMapLayer } from '../cesium-map-layer';
import { CesiumFeatureLayerProps } from '../cesium-feature-layer';
import {
    CesiumPointPrimitiveRenderer,
    CesiumLinePrimitiveRenderer,
    CesiumPolygonPrimitiveRenderer,
    CesiumGeometryPrimitiveRenderer,
    GeometryStyle,
    CesiumGeometryPrimitiveFeature
} from './geometry-primitive-renderers';

export class CesiumPrimitiveFeatureLayer extends CesiumMapLayer implements IFeatureLayerRenderer {
    protected featureMap_: Record<string, CesiumGeometryPrimitiveFeature> = {};

    protected pointRenderer_: CesiumPointPrimitiveRenderer | undefined;
    protected lineRenderer_: CesiumLinePrimitiveRenderer | undefined;
    protected polygonRenderer_: CesiumPolygonPrimitiveRenderer | undefined;

    protected clampToGround_: boolean;
    protected onFeatureHover_: ((feature: IFeature<any>, coordinate: GeoJSON.Position) => void) | undefined;
    protected onFeatureSelect_: ((feature: IFeature<any>, coordinate: GeoJSON.Position) => void) | undefined;
    protected coordPickMode_: CesiumFeatureCoordPickMode;

    constructor(config: FeatureLayerRendererConfig & CesiumFeatureLayerProps) {
        super(config);

        this.clampToGround_ = config.clampToGround || false;
        this.onFeatureHover_ = config.onFeatureHover;
        this.onFeatureSelect_ = config.onFeatureSelect;
        this.coordPickMode_ = config.coordPickMode || CesiumFeatureCoordPickMode.Ellipsoid;
    }

    addFeature(id: string, geometry: FeatureGeometry, style: IFeatureStyle, data: any) {
        if (!geometry) {
            return;
        }

        const geometryRenderer = this.getOrCreateGeometryRenderer_(geometry.type);
        const geometryStyle = this.getStyleForGeometry_(style, geometry.type);
        if (geometryRenderer && geometryStyle) {
            try {
                const feature: CesiumGeometryPrimitiveFeature = geometryRenderer.addFeature(id, geometry, geometryStyle, data);
                feature.geometryRenderer = geometryRenderer;
                feature.geometryType = geometry.type;
                feature.data = data;

                this.featureMap_[id] = feature;

                this.mapRenderer_.getViewer().scene.requestRender();

                return feature;
            } catch {
                return undefined;
            }
        }
    }

    updateFeatureGeometry(id: string, geometry: FeatureGeometry) {
        const feature = this.getFeature(id);
        if (feature) {
            const geometryRenderer = this.getOrCreateGeometryRenderer_(geometry.type);
            if (geometryRenderer === feature.geometryRenderer) {
                geometryRenderer.updateGeometry(feature, geometry);
                this.mapRenderer_.getViewer().scene.requestRender();
            } else {
                throw 'Feature geometry must be of the same class';
            }
        }
    }

    updateFeatureStyle(id: string, style: IFeatureStyle) {
        const feature = this.getFeature(id);
        if (feature) {
            const geometryStyle = this.getStyleForGeometry_(style, feature.geometryType);
            if (geometryStyle) {
                feature.geometryRenderer.updateStyle(feature, geometryStyle);
                this.mapRenderer_.getViewer().scene.requestRender();
            }
        }
    }

    removeFeature(id: string) {
        const feature = this.getFeature(id);

        if (feature) {
            feature.geometryRenderer.removeFeature(feature);
            this.mapRenderer_.getViewer().scene.requestRender();
        }

        delete this.featureMap_[id];
    }

    removeAllFeatures() {
        if (this.pointRenderer_) {
            this.pointRenderer_.clear();
        }
        if (this.lineRenderer_) {
            this.lineRenderer_.clear();
        }
        if (this.polygonRenderer_) {
            this.polygonRenderer_.clear();
        }

        this.featureMap_ = {};

        this.mapRenderer_.getViewer().scene.requestRender();
    }

    hasFeature(id: string) {
        return !!this.featureMap_[id];
    }

    getFeatureData(id: string) {
        const feature = this.featureMap_[id];
        return feature ? feature.data : undefined;
    }

    getFeature(id: string) {
        return this.featureMap_[id];
    }

    shouldReceiveFeatureHoverEvents() {
        return !!this.onFeatureHover_;
    }

    shouldReceiveFeatureSelectEvents() {
        return !!this.onFeatureSelect_;
    }

    onFeatureHover(coordinate: Cartesian3, pickInfo: PickInfo) {
        if (this.onFeatureHover_) {
            const cartographic = Cartographic.fromCartesian(coordinate);
            this.onFeatureHover_(
                {
                    id: pickInfo.id,
                    data: pickInfo.data
                },
                [CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude), cartographic.height]
            );
        }
    }

    onFeatureSelect(coordinate: Cartesian3, pickInfo: PickInfo) {
        if (this.onFeatureSelect_) {
            const cartographic = Cartographic.fromCartesian(coordinate);
            this.onFeatureSelect_(
                {
                    id: pickInfo.id,
                    data: pickInfo.data
                },
                [CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude), cartographic.height]
            );
        }
    }

    getFeaturePickMode() {
        return this.coordPickMode_;
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

    protected getStyleForGeometry_(style: IFeatureStyle, geometryType: FeatureGeometry['type']): GeometryStyle | undefined {
        let geometryStyle: GeometryStyle | undefined;

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
            case 'BBox':
            case 'Circle':
                geometryStyle = style.polygon;
                break;
        }

        return geometryStyle;
    }

    protected getOrCreateGeometryRenderer_(geometryType: FeatureGeometry['type']) {
        let geometryRenderer: CesiumGeometryPrimitiveRenderer;

        switch (geometryType) {
            case 'Point':
            case 'MultiPoint':
                if (!this.pointRenderer_) {
                    this.pointRenderer_ = new CesiumPointPrimitiveRenderer({
                        scene: this.mapRenderer_.getViewer().scene,
                        clampToGround: this.clampToGround_,
                        layer: this
                    });
                    this.primitives_.add(this.pointRenderer_.getPrimitives());
                }
                geometryRenderer = this.pointRenderer_;
                break;
            case 'LineString':
            case 'MultiLineString':
                if (!this.lineRenderer_) {
                    this.lineRenderer_ = new CesiumLinePrimitiveRenderer({
                        clampToGround: this.clampToGround_,
                        layer: this
                    });
                    this.primitives_.add(this.lineRenderer_.getPrimitives());
                }
                geometryRenderer = this.lineRenderer_;
                break;
            case 'Polygon':
            case 'MultiPolygon':
            case 'BBox':
            case 'Circle':
                if (!this.polygonRenderer_) {
                    this.polygonRenderer_ = new CesiumPolygonPrimitiveRenderer({
                        clampToGround: this.clampToGround_,
                        layer: this
                    });
                    this.primitives_.add(this.polygonRenderer_.getPrimitives());
                }
                geometryRenderer = this.polygonRenderer_;
                break;
        }

        return geometryRenderer;
    }
}
