import Map from 'ol/Map';
import View from 'ol/View';
import { get as getProj, transform, transformExtent } from 'ol/proj';

import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { getCenter as getExtentCenter } from 'ol/extent';
import Attribution from 'ol/control/Attribution.js';

import {
    IMapRenderer,
    IMapRendererProps,
    IMapViewport,
    IMapProjection,
    FitExtentOptions,
    exportImage,
    ImageExportOptions,
    BBox,
    Size
} from '@oidajs/core';

import { olLayersFactory } from '../layers/ol-layers-factory';
import { olInteractionsFactory } from '../interactions/ol-interactions-factory';

import { OLGroupLayer } from '../layers';

import 'ol/ol.css';

export const OL_RENDERER_ID = 'ol';

export class OLMapRenderer implements IMapRenderer {
    private viewer_!: Map;

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
        return;
    }

    fitExtent(extent, options?: FitExtentOptions) {
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

            let padding: number[] | undefined;
            if (options?.padding) {
                const size = this.getSize();
                // when the map has no size (no target?) the fit computation will
                // assume a size of [100, 100]. We ignore the padding option in this case
                if (size) {
                    padding = [
                        Math.round(options.padding[0] * size[0]),
                        Math.round(options.padding[1] * size[1]),
                        Math.round(options.padding[0] * size[0]),
                        Math.round(options.padding[0] * size[1])
                    ];
                }
            }
            view.fit(extent, {
                duration: options?.animate ? 1000 : 0,
                padding: padding
            });
        }
    }

    getViewportExtent() {
        const view = this.viewer_.getView();

        let extent = view.calculateExtent(this.getSize());

        const projection = view.getProjection();
        if (projection.getCode() !== 'EPSG:4326') {
            extent = transformExtent(extent, projection, 'EPSG:4326');
            if (isNaN(extent[0]) || isNaN(extent[1]) || isNaN(extent[2]) || isNaN(extent[3])) {
                return undefined;
            }
        }

        return extent as BBox;
    }

    setLayerGroup(group: OLGroupLayer) {
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
        return this.viewer_.getSize() as Size;
    }

    updateSize() {
        if (this.viewer_) {
            this.viewer_.updateSize();
        }
    }

    export(options: ImageExportOptions) {
        return new Promise<string>((resolve, reject) => {
            // extracted from https://openlayers.org/en/latest/examples/export-map.html
            this.viewer_.once('rendercomplete', () => {
                const mapCanvas = document.createElement('canvas');
                const size = this.viewer_.getSize() || [options.width || 1024, options.height || 1024];
                mapCanvas.width = size[0];
                mapCanvas.height = size[1];
                const mapContext = mapCanvas.getContext('2d');
                if (mapContext) {
                    Array.prototype.forEach.call(
                        this.viewer_.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
                        (canvas) => {
                            if (canvas.width > 0) {
                                const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
                                mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
                                let matrix;
                                const transform = canvas.style.transform;
                                if (transform) {
                                    // Get the transform parameters from the style's transform matrix
                                    matrix = transform
                                        .match(/^matrix\(([^(]*)\)$/)[1]
                                        .split(',')
                                        .map(Number);
                                } else {
                                    matrix = [
                                        parseFloat(canvas.style.width) / canvas.width,
                                        0,
                                        0,
                                        parseFloat(canvas.style.height) / canvas.height,
                                        0,
                                        0
                                    ];
                                }
                                // Apply the transform to the export map context
                                CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
                                const backgroundColor = canvas.parentNode.style.backgroundColor;
                                if (backgroundColor) {
                                    mapContext.fillStyle = backgroundColor;
                                    mapContext.fillRect(0, 0, canvas.width, canvas.height);
                                }
                                mapContext.drawImage(canvas, 0, 0);
                            }
                        }
                    );
                    mapContext.globalAlpha = 1;
                    mapContext.setTransform(1, 0, 0, 1, 0, 0);
                }
                resolve(exportImage(mapCanvas, options));
            });
            this.viewer_.renderSync();
        });
    }

    destroy() {
        this.viewer_.setTarget(undefined);
    }

    private initRenderer_(props: IMapRendererProps) {
        register(proj4);

        this.viewer_ = new Map({
            target: props.target,
            controls: [new Attribution({ target: props.creditsTarget, collapseLabel: '<' })],
            layers: [],
            view: this.createViewFromProps_(props.viewport, props.projection)
        });

        if (props.onViewUpdating) {
            this.viewer_.on('movestart', () => {
                props.onViewUpdating!();

                const duringMove = (evt) => {
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

    private computeCurrentView_(): IMapViewport | undefined {
        const view = this.viewer_.getView();
        let center = view.getCenter();
        if (!center) {
            return undefined;
        }
        let resolution = view.getResolution();
        if (!resolution) {
            return undefined;
        }
        const viewMetersPerUnit = view.getProjection().getMetersPerUnit();
        if (viewMetersPerUnit) {
            resolution *= viewMetersPerUnit;
        }

        const rotation = view.getRotation();

        if (view.getProjection().getCode() !== 'EPSG:4326') {
            center = transform(center, view.getProjection(), 'EPSG:4326');
        }
        if (!center) {
            return undefined;
        }

        return {
            center,
            resolution,
            rotation,
            pitch: 0
        } as IMapViewport;
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

        const projection = getProj(projProps.code) || undefined;
        const extent = projProps.extent || undefined;
        if (projection && extent) {
            // TODO: check if this is required and if it affects subsequent usage of the same projection
            // without an extent (side effect on projection object?)
            projection.setExtent(extent);
        }
        const view = new View({
            projection,
            extent
        });

        view['wrapX'] = projProps.wrapX;

        this.updateViewFromProps_(view, viewProps);

        return view;
    }

    private updateViewFromProps_(view, viewProps, animate?: boolean) {
        const projection = view.getProjection();

        const resolution = viewProps.resolution / projection.getMetersPerUnit();
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
