import CustomDataSource from 'cesium/Source/DataSources/CustomDataSource';

import { CesiumMapLayer } from '../cesium-map-layer';
import { geometryEntityRendererFactory } from './geometry-entity-renderers';

import { IFeatureLayerRenderer, IFeatureStyle, Geometry } from '@oida/core';

import { updateDataSource } from '../../utils';

export class CesiumEntityFeatureLayer extends CesiumMapLayer implements IFeatureLayerRenderer {

    protected clampToGround_: boolean = false;
    protected dataSource_;

    constructor(config) {
        super(config);

        this.clampToGround_ = config.clampToGround || false;
        this.dataSource_ = new CustomDataSource();
        this.dataSources_.add(this.dataSource_);
    }

    addFeature(id: string, geometry: Geometry, style: IFeatureStyle) {

        let geometryRenderer = geometryEntityRendererFactory.create(geometry.type);

        if (geometryRenderer) {
            let entity = geometryRenderer.create(id, geometry, style, {
                clampToGround: this.clampToGround_
            });

            if (entity) {
                this.dataSource_.entities.add(entity);
                entity._children.forEach(childEntity => {
                    this.dataSource_.entities.add(childEntity);
                });
                entity.geometryRenderer = geometryRenderer;
            }

            this.updateDataSource_();
        }
    }

    updateFeatureGeometry(id: string, geometry: Geometry) {

        let entity = this.dataSource_.entities.getById(id);
        if (entity) {
            let geometryRenderer = geometryEntityRendererFactory.create(geometry.type);
            if (geometryRenderer) {
                if (geometryRenderer === entity.geometryRenderer) {
                    geometryRenderer.updateGeometry(entity, geometry);
                    this.updateDataSource_();
                } else {
                    throw 'Feature geometry must be of the same class';
                }
            }
        }
    }

    updateFeatureStyle(id, style) {

        let entity = this.dataSource_.entities.getById(id);
        if (entity) {
            entity.geometryRenderer.updateStyle(entity, style);
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

    removeAllFeatures() {
        this.dataSource_.entities.removeAll();
        this.updateDataSource_();
    }

    protected updateDataSource_() {
        updateDataSource(this.dataSource_, this.mapRenderer_.getViewer().scene);
    }

}
