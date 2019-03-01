import Map from 'ol/Map';
import View from 'ol/View';
import { get as getProj, transform } from 'ol/proj';

import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { getCenter as getExtentCenter } from 'ol/extent';

import { mapRendererFactory, IMapRenderer, IMapRendererProps, IMapViewport, IMapProjection } from '@oida/core';

import { olLayersFactory } from '../layers/ol-layers-factory';
import { olInteractionsFactory } from '../interactions/ol-interactions-factory';

import { OLGroupLayer } from '../layers';

export const OL_RENDERER_ID = 'ol';

export class OLMapRenderer implements IMapRenderer {

    private viewer_: Map;
    private layerGroup_: OLGroupLayer;

    constructor(props: IMapRendererProps) {
        this.initRenderer_(props);
    }

    setTarget(target: HTMLElement) {
        this.viewer_.setTarget(target);
    }

    setViewport(viewport: IMapViewport, animate?: boolean) {
        this.updateViewFromProps_(this.viewer_.getView(), viewport, animate);
    }

    fitExtent(extent, animate?: boolean) {
        this.viewer_.getView().fit(extent, {
            duration: animate ? 1000 : 0
        });
    }

    getViewportExtent() {
        return this.viewer_.getView().calculateExtent(this.getSize());
    }

    setLayerGroup(group: OLGroupLayer) {
        this.layerGroup_ = group;
        this.viewer_.setLayerGroup(group.getOLObject());
    }

    getLayersFactory() {
        return olLayersFactory;
    }

    getInteractionsFactory() {
        return olInteractionsFactory;
    }

    getViewer() {
        return this.viewer_;
    }

    getSize() {
        return this.viewer_.getSize();
    }

    destroy() {
        this.viewer_.setTarget(null);
    }

    private initRenderer_(props: IMapRendererProps) {

        register(proj4);

        this.viewer_ = new Map({
            target: props.target,
            controls: [],
            layers: [],
            view: this.createViewFromProps_(props.viewport, props.projection)
        });

        if (typeof(props.onViewUpdating) === 'function') {
            this.viewer_.on('movestart', () => {

                props.onViewUpdating();

                let duringMove = (evt) => {
                    props.onViewUpdating(this.computeCurrentView_());
                };

                this.viewer_.on('postrender', duringMove);

                this.viewer_.once('moveend', () => {
                    this.viewer_.un('postrender', duringMove);
                });

            });
        }

        if (typeof(props.onViewUpdated) === 'function') {
            this.viewer_.on('moveend', () => {
                props.onViewUpdated(this.computeCurrentView_());
            });
        }

    }

    private computeCurrentView_() : IMapViewport {
        let view = this.viewer_.getView();
        let center = view.getCenter();
        let resolution = view.getResolution() * view.getProjection().getMetersPerUnit();
        let rotation = view.getRotation();

        if (view.getProjection().getCode() !== 'EPSG:4326') {
            center = transform(center, view.getProjection(), 'EPSG:4326');
        }

        return {
            center,
            resolution,
            rotation,
            pitch: 0
        };
    }

    private createViewFromProps_(viewProps: IMapViewport, projProps: IMapProjection) {

        if (!proj4.defs(projProps.code)) {
            if (projProps.projDef) {
                proj4.defs(projProps.code, projProps.projDef);
                register(proj4);
            } else {
                projProps.code = 'EPSG:4326';
            }
        }

        let projection = getProj(projProps.code);
        let extent = projProps.extent || undefined;
        if (extent) {
            projection.setExtent(projProps.extent);
        }
        let view = new View({
            projection,
            extent
        });

        view['wrapX'] = projProps.wrapX;

        this.updateViewFromProps_(view, viewProps);

        return view;
    }

    private updateViewFromProps_(view, viewProps, animate?: boolean) {

        let projection = view.getProjection();

        let resolution = viewProps.resolution / projection.getMetersPerUnit();
        let center = viewProps.center.slice();
        if (projection.getCode() !== 'EPSG:4326') {
            center = transform(center, 'EPSG:4326', projection);
            if (isNaN(center[0]) || isNaN(center[1])) {
                center = getExtentCenter(projection.getExtent());
            }
        }

        if (animate) {
            view.animate({
                center: center,
                resolution: resolution
            });
        } else {
            view.setCenter(center);
            view.setResolution(resolution);
        }
    }

}

mapRendererFactory.register(OL_RENDERER_ID, (props) => {
    let renderer =  new OLMapRenderer(props);
    return renderer;
});

