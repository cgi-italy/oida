
import LayerBase from 'ol/layer/Base';
import { transformExtent } from 'ol/proj';

import { IFeature, IMapLayerRenderer, MapLayerRendererConfig } from '@oidajs/core';

import { OLMapRenderer } from '../map/ol-map-renderer';

export abstract class OLMapLayer<T extends LayerBase = LayerBase> implements IMapLayerRenderer {

    protected mapRenderer_: OLMapRenderer;
    protected olImpl_: T;

    constructor(config: MapLayerRendererConfig) {
        let {mapRenderer, ...other} = config;

        this.mapRenderer_ = mapRenderer as OLMapRenderer;
        this.olImpl_ = this.createOLObject_(other);
    }

    setVisible(visible: boolean) {
        this.olImpl_.setVisible(visible);
    }

    setOpacity(opacity: number) {
        this.olImpl_.setOpacity(opacity);
    }

    setZIndex(zIndex: number) {
        this.olImpl_.setZIndex(zIndex);
    }

    setExtent(extent: number[] | undefined) {

        if (extent) {
            let projection = this.mapRenderer_.getViewer().getView().getProjection();

            if (projection.getCode() !== 'EPSG:4326') {
                extent = transformExtent(extent, 'EPSG:4326', projection);
                if (extent) {
                    if (isNaN(extent[0]) || isNaN(extent[1]) || isNaN(extent[2]) || isNaN(extent[3])) {
                        extent = undefined;
                    }
                }
            }
        }

        this.olImpl_.setExtent(extent);
    }

    destroy() {
        this.destroyOLObject_();
    }

    getOLObject() {
        return this.olImpl_;
    }

    /**
     * Override this in inherited classes to enable custom feature hovering behaviours
     *
     * @returns a flag indicating if this layer should receive feature mouse hovering events
     */
    shouldReceiveFeatureHoverEvents() {
        return false;
    }

    /**
     * Called by {@link OLFeatureHoverInteraction} when the mouse is overing a feature of this layer
     * Called only when {@link OLMapLayer.shouldReceiveFeatureHoverEvents} returns true
     *
     * @param coordinate the hovered feature geographic coordinate
     * @param feature the hovered feature
     */
    onFeatureHover(coordinate: GeoJSON.Position, feature: IFeature) {}

    /**
     * Override this in inherited classes to enable custom feature select behaviours
     *
     * @returns a flag indicating if this layer should receive feature mouse hovering events
     */
    shouldReceiveFeatureSelectEvents() {
        return false;
    }

    /**
     * Called by {@link OLFeatureSelectInteraction} when the mouse is overing a feature of this layer
     * Called only when {@link OLMapLayer.shouldReceiveFeatureSelectEvents} returns true
     *
     * @param coordinate the hovered feature geographic coordinate
     * @param feature the hovered feature
     */
    onFeatureSelect(coordinate: GeoJSON.Position, feature: IFeature) {}

    protected abstract createOLObject_(config);
    protected abstract destroyOLObject_();

}

