import PrimitiveCollection from 'cesium/Source/Scene/PrimitiveCollection';

import DataSourceCollection from 'cesium/Source/DataSources/DataSourceCollection';
import CustomDataSource from 'cesium/Source/DataSources/CustomDataSource';
import ImageryLayerCollection from 'cesium/Source/Scene/ImageryLayerCollection';
import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';

import { ILayerRenderer } from '@oida/core';

import { CesiumMapRenderer } from '../map/cesium-map-renderer';
import { updateDataSource } from '../utils/render';

export class CesiumMapLayer implements ILayerRenderer {

    protected mapRenderer_: CesiumMapRenderer;
    protected parent_: CesiumMapLayer | undefined;
    protected visible_: boolean = true;
    protected alpha_: number = 1.0;
    protected imageries_;
    protected primitives_;
    protected dataSources_;

    constructor(config) {
        this.mapRenderer_ = config.mapRenderer;

        this.initImageries_();
        this.initPrimitives_();
        this.initDataSources_();
    }

    setVisible(visible) {
        this.visible_ = visible;
        this.primitives_.show = visible;
        this.updateImageryVisibility_(this.imageries_, this.parent_ ? this.parent_.isVisible() : true);
        this.updateDataSourcesVisibility_(this.dataSources_, this.parent_ ? this.parent_.isVisible() : true);

        this.mapRenderer_.getViewer().scene.requestRender();
    }

    setOpacity(opacity) {
        this.alpha_ = opacity;
        this.updateImageryOpacity_(this.imageries_);
        this.mapRenderer_.getViewer().scene.requestRender();
    }

    setZIndex(zIndex) {
        this.imageries_.zIndex = zIndex;
        this.mapRenderer_.refreshImageriesFromEvent({
            type: 'zIndex',
            collection: this.imageries_,
            zIndex: zIndex
        });
    }

    setExtent(extent) {
    }

    setParent(parent) {
        this.parent_ = parent;

        if (this.parent_) {
            this.updateImageryOpacity_(this.imageries_);
            this.updateImageryVisibility_(this.imageries_, this.parent_.isVisible());
            this.updateDataSourcesVisibility_(this.dataSources_, this.parent_.isVisible());
        }
    }

    getAlpha() {
        let alpha = this.alpha_;
        if (this.parent_) {
            alpha *= this.parent_.getAlpha();
        }
        return alpha;
    }

    isVisible() {
        if (this.parent_) {
            return this.visible_ && this.parent_.isVisible();
        } else {
            return this.visible_;
        }
    }

    getImageries() {
        return this.imageries_;
    }

    getPrimitives() {
        return this.primitives_;
    }

    getDataSources() {
        return this.dataSources_;
    }

    destroy() {
        this.imageries_.layerAdded.removeEventListener(this.onAddImageries_, this);
        this.imageries_.layerRemoved.removeEventListener(this.onRemoveImageries_, this);

        this.dataSources_.dataSourceAdded.removeEventListener(this.onAddDataSources_, this);
        this.dataSources_.dataSourceRemoved.removeEventListener(this.onRemoveDataSources_, this);

        this.primitives_.destroy();
        this.dataSources_.destroy();
        this.imageries_.destroy();
    }

    protected initImageries_() {
        this.imageries_ = new ImageryLayerCollection();

        this.imageries_.layerAdded.addEventListener(this.onAddImageries_, this);
        this.imageries_.layerRemoved.addEventListener(this.onRemoveImageries_, this);
    }

    protected initPrimitives_() {
        this.primitives_ = new PrimitiveCollection({
            destroyPrimitives: false
        });
    }

    protected initDataSources_() {
        this.dataSources_ = new DataSourceCollection();

        this.dataSources_.dataSourceAdded.addEventListener(this.onAddDataSources_, this);
        this.dataSources_.dataSourceRemoved.addEventListener(this.onRemoveDataSources_, this);
    }

    protected onAddImageries_(imageries, idx) {

        if (imageries instanceof ImageryLayer || imageries.length) {
            this.mapRenderer_.refreshImageriesFromEvent({
                type: 'add',
                collection: this.imageries_,
                item: imageries,
                idx: idx
            });
        }
    }

    protected onRemoveImageries_(imageries, idx) {

        if (imageries instanceof ImageryLayer || imageries.length) {
            this.mapRenderer_.refreshImageriesFromEvent({
                type: 'remove',
                collection: this.imageries_,
                item: imageries,
                idx: idx
            });
        }
    }

    protected onAddDataSources_(parentCollection, dataSources) {

        let idx = parentCollection.indexOf(dataSources);

        if (dataSources instanceof CustomDataSource || dataSources.length) {
            this.mapRenderer_.refreshDataSourcesFromEvent({
                type: 'add',
                collection: this.dataSources_,
                item: dataSources,
                idx: idx
            });
        }
    }

    protected onRemoveDataSources_(parentCollection, dataSources) {

        if (dataSources instanceof CustomDataSource || dataSources.length) {
            this.mapRenderer_.refreshDataSourcesFromEvent({
                type: 'remove',
                collection: this.dataSources_,
                item: dataSources
            });
        }
    }


    protected updateImageryVisibility_(imageries, parentVisible) {

        imageries = imageries || this.imageries_;

        if (imageries instanceof ImageryLayer) {
            imageries.show = this.visible_ && parentVisible;
        } else {
            for (let i = 0; i < imageries.length; ++i) {
                this.updateImageryVisibility_(imageries.get(i), this.visible_ && parentVisible);
            }
        }

    }

    protected updateImageryOpacity_(imageries) {

        imageries = imageries || this.imageries_;

        if (imageries instanceof ImageryLayer) {
            imageries.alpha = this.getAlpha();
        } else {
            for (let i = 0; i < imageries.length; ++i) {
                this.updateImageryOpacity_(imageries.get(i));
            }
        }
    }

    protected updateDataSourcesVisibility_(dataSources, parentVisible) {
        dataSources = dataSources || this.dataSources_;

        if (dataSources instanceof CustomDataSource) {
            dataSources.show = this.visible_ && parentVisible;
            updateDataSource(dataSources, this.mapRenderer_.getViewer().scene);
        } else {
            for (let i = 0; i < dataSources.length; ++i) {
                this.updateDataSourcesVisibility_(dataSources.get(i), this.visible_ && parentVisible);
            }
        }
    }
}
