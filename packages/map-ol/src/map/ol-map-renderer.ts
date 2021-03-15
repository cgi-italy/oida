import Map from 'ol/Map';
import View from 'ol/View';
import { get as getProj, transform, transformExtent } from 'ol/proj';

import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { getCenter as getExtentCenter } from 'ol/extent';

import {
    mapRendererFactory, IMapRenderer, IMapRendererProps, IMapViewport, IMapProjection,
    IDynamicFactory, ILayerRenderer
} from '@oida/core';

import { olLayersFactory } from '../layers/ol-layers-factory';
import { olInteractionsFactory } from '../interactions/ol-interactions-factory';

import { OLGroupLayer } from '../layers';

import 'ol/ol.css';

export const OL_RENDERER_ID = 'ol';

export class OLMapRenderer implements IMapRenderer {

    private viewer_: Map;
    private layerGroup_: OLGroupLayer | undefined;

    constructor(props: IMapRendererProps) {
        this.initRenderer_(props);
    }

    get id() {
        return OL_RENDERER_ID;
    }

    setTarget(target: HTMLElement) {
        this.viewer_.setTarget(target);
    }

    setViewport(viewport: IMapViewport, animate?: boolean) {
        this.updateViewFromProps_(this.viewer_.getView(), viewport, animate);
    }

    updateRendererProps(props) {

    }

    fitExtent(extent, animate?: boolean) {

        const view = this.viewer_.getView();
        const projection = view.getProjection();

        const eps = 0.0001;
        if (extent[2] - extent[0] <= eps || extent[3] - extent[1] <= eps) {
            const center = transform([extent[0], extent[1]], 'EPSG:4326', view.getProjection());
            if (isNaN(center[0]) || isNaN(center[1])) {
                return;
            }
            view.animate({
                center: center
            });
        } else {

            if (projection.getCode() !== 'EPSG:4326') {
                extent = transformExtent(extent, 'EPSG:4326', projection);
                if (isNaN(extent[0]) || isNaN(extent[1]) || isNaN(extent[2]) || isNaN(extent[3])) {
                    return;
                }
            }
            view.fit(extent, {
                duration: animate ? 1000 : 0
            });
        }
    }

    getViewportExtent() {

        let view = this.viewer_.getView();

        let extent =  view.calculateExtent(this.getSize());

        let projection = view.getProjection();
        if (projection.getCode() !== 'EPSG:4326') {
            extent = transformExtent(extent, projection, 'EPSG:4326');
            if (isNaN(extent[0]) || isNaN(extent[1]) || isNaN(extent[2]) || isNaN(extent[3])) {
                return null;
            }
        }

        return extent;
    }

    setLayerGroup(group: OLGroupLayer) {
        this.layerGroup_ = group;
        this.viewer_.setLayerGroup(group.getOLObject());
    }

    getLayersFactory() {
        return olLayersFactory as unknown as IDynamicFactory<ILayerRenderer>;
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

    updateSize() {
        if (this.viewer_) {
            this.viewer_.updateSize();
        }
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

        if (props.onViewUpdating) {
            this.viewer_.on('movestart', () => {

                props.onViewUpdating!();

                let duringMove = (evt) => {
                    props.onViewUpdating!(this.computeCurrentView_());
                };

                this.viewer_.on('postrender', duringMove);

                this.viewer_.once('moveend', () => {
                    this.viewer_.un('postrender', duringMove);
                });

            });
        }

        if (props.onViewUpdated) {
            this.viewer_.on('moveend', () => {
                props.onViewUpdated!(this.computeCurrentView_());
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

