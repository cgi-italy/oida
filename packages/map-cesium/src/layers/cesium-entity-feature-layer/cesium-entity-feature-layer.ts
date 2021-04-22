import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Cartographic from 'cesium/Source/Core/Cartographic';
import CesiumMath from 'cesium/Source/Core/Math';
import CustomDataSource from 'cesium/Source/DataSources/CustomDataSource';

import { IFeatureLayerRenderer, IFeatureStyle, IFeature, FeatureGeometry, MapLayerRendererConfig, FeatureLayerRendererConfig } from '@oida/core';

import { CesiumFeatureCoordPickMode, PickInfo, PICK_INFO_KEY, updateDataSource } from '../../utils';
import { CesiumMapLayer } from '../cesium-map-layer';
import { CesiumFeatureLayerProps } from '../cesium-feature-layer';
import { geometryEntityRendererFactory } from './geometry-entity-renderers';

export class CesiumEntityFeatureLayer extends CesiumMapLayer implements IFeatureLayerRenderer {

    protected clampToGround_: boolean = false;
    protected onFeatureHover_: ((feature: IFeature<any>, coordinate: GeoJSON.Position) => void) | undefined;
    protected onFeatureSelect_: ((feature: IFeature<any>, coordinate: GeoJSON.Position) => void) | undefined;
    protected coordPickMode_: CesiumFeatureCoordPickMode;
    protected dataSource_;

    constructor(config: FeatureLayerRendererConfig & CesiumFeatureLayerProps) {
        super(config);

        this.clampToGround_ = config.clampToGround || false;
        this.onFeatureHover_ = config.onFeatureHover;
        this.onFeatureSelect_ = config.onFeatureSelect;
        this.coordPickMode_ = config.coordPickMode || CesiumFeatureCoordPickMode.Ellipsoid;

        this.dataSource_ = new CustomDataSource();
        this.dataSources_.add(this.dataSource_);
    }

    addFeature(id: string, geometry: FeatureGeometry, style: IFeatureStyle, data: any) {

        if (!geometry) {
            return;
        }

        let geometryRenderer = geometryEntityRendererFactory.create(geometry.type, {});

        if (geometryRenderer) {

            try {
                let entity = geometryRenderer.create(id, geometry, style, {
                    clampToGround: this.clampToGround_
                });

                if (entity) {
                    this.dataSource_.entities.add(entity);
                    entity._children.forEach(childEntity => {
                        this.dataSource_.entities.add(childEntity);
                    });
                    entity.geometryRenderer = geometryRenderer;
                    entity.geometryType = geometry.type;

                    const pickInfo: PickInfo = {
                        id: id,
                        data: data,
                        layer: this,
                        pickable: this.isPickable_(geometry.type, style)
                    };

                    entity[PICK_INFO_KEY] = pickInfo;

                    this.updateDataSource_();
                }

                return entity;
            } catch {
                return undefined;
            }
        }
    }

    updateFeatureGeometry(id: string, geometry: FeatureGeometry) {

        let entity = this.dataSource_.entities.getById(id);
        if (entity) {
            if (entity.geometryType === geometry.type) {
                entity.geometryRenderer.updateGeometry(entity, geometry);
                this.updateDataSource_();
            } else {
                throw 'Feature geometry must be of the same class';
            }
        }
    }

    updateFeatureStyle(id: string, style: IFeatureStyle) {

        let entity = this.dataSource_.entities.getById(id);
        if (entity) {
            entity.geometryRenderer.updateStyle(entity, style);
            entity[PICK_INFO_KEY].pickable = this.isPickable_(entity.geometryType, style);
            this.updateDataSource_();
        }
    }

    removeFeature(id: string) {

        let entity = this.dataSource_.entities.getById(id);

        if (entity) {
            entity._children.forEach((childEntity) => {
                this.dataSource_.entities.remove(childEntity);
            });
            this.dataSource_.entities.remove(entity);
            this.updateDataSource_();
        }

    }

    getFeature(id: string) {
        return this.dataSource_.entities.getById(id);
    }

    hasFeature(id: string) {
        return !!this.getFeature(id);
    }

    getFeatureData(id: string) {
        const feature = this.getFeature(id);
        return feature ? feature.data : undefined;
    }

    removeAllFeatures() {
        this.dataSource_.entities.removeAll();
        this.updateDataSource_();
    }

    shouldReceiveFeatureHoverEvents() {
        return !!this.onFeatureHover_;
    }

    shouldReceiveFeatureSelectEvents() {
        return !!this.onFeatureSelect_;
    }

    onFeatureHover(coordinate: Cartesian3, pickInfo: PickInfo) {
        let cartographic = Cartographic.fromCartesian(coordinate);
        this.onFeatureHover_!({
            id: pickInfo.id,
            data: pickInfo.data
        }, [
            CesiumMath.toDegrees(cartographic.longitude),
            CesiumMath.toDegrees(cartographic.latitude),
            cartographic.height
        ]);
    }

    onFeatureSelect(coordinate: Cartesian3, pickInfo: PickInfo) {
        let cartographic = Cartographic.fromCartesian(coordinate);
        this.onFeatureSelect_!({
            id: pickInfo.id,
            data: pickInfo.data
        }, [
            CesiumMath.toDegrees(cartographic.longitude),
            CesiumMath.toDegrees(cartographic.latitude),
            cartographic.height
        ]);
    }

    getFeaturePickMode() {
        return this.coordPickMode_;
    }

    protected isPickable_(geometryType, style: IFeatureStyle) {
        let pickable: boolean;
        if (geometryType === 'Point' || geometryType === 'MultiPoint') {
            pickable = !style.point?.pickingDisabled;
        } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            pickable = !style.line?.pickingDisabled;
        } else {
            pickable = !style.polygon?.pickingDisabled;
        }
        return pickable;
    }

    protected updateDataSource_() {
        updateDataSource(this.dataSource_, this.mapRenderer_.getViewer().scene);
    }

}

