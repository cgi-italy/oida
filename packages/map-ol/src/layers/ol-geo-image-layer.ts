import ImageLayer from 'ol/layer/Image';
import CanvasSource from 'ol/source/ImageCanvas';

import { GEO_IMAGE_LAYER_ID, IGeoImageLayerRenderer, GeoImageLayerSource, GeoImageLayerFootprint, GeoImageLayerConfig } from '@oida/core';

import { GLGeoImageProjector } from '../utils';
import { olLayersFactory } from './ol-layers-factory';
import { OLMapLayer } from './ol-map-layer';

export class OLGeoImageLayer extends OLMapLayer<ImageLayer> implements IGeoImageLayerRenderer {

    protected source_: GeoImageLayerSource | undefined;
    protected footprint_: GeoImageLayerFootprint;
    protected imageProjector_: GLGeoImageProjector;

    constructor(config: GeoImageLayerConfig) {
        super(config);

        this.source_ = config.source;
        this.footprint_ = config.footprint;

        this.imageProjector_ = new GLGeoImageProjector({
            footprint: config.footprint,
            source: config.source
        });
    }

    updateSource(source: GeoImageLayerSource | undefined) {
        this.source_ = source;
        this.imageProjector_.setSource(source);
        this.forceRefresh();
    }

    updateFootprint(footprint: GeoImageLayerFootprint) {
        this.footprint_ = footprint;
        this.imageProjector_.setFootprint(footprint);
        this.olImpl_.getSource().refresh();
    }

    forceRefresh() {
        this.imageProjector_.refreshSource();
        this.olImpl_.getSource().refresh();
    }

    protected createOLObject_(config) {

        const layer = new ImageLayer({
            source: new CanvasSource({
                canvasFunction: (extent, resolution, pixelRatio, imgSize, projection) => {
                    this.imageProjector_.render(extent, imgSize);
                    return this.imageProjector_.getCanvas();
                },
                ratio: 1,
                projection: config.srs
            }),
            extent: config.extent,
            zIndex: config.zIndex || 0
        });

        this.mapRenderer_.getViewer().once('postrender', () => {
            this.allowContinousUpdate_(layer);
        });

        return layer;
    }

    protected destroyOLObject_() {
    }

    protected allowContinousUpdate_(layer: ImageLayer) {
        const olLayerRenderer = this.olImpl_.getRenderer();
        if (olLayerRenderer) {
            const prototypePrepareFrame = olLayerRenderer.prepareFrame;
            olLayerRenderer.prepareFrame = (frameState) => {
                return prototypePrepareFrame.call(olLayerRenderer, {
                    ...frameState,
                    viewHints: [0, 0] // force openlayers to render the layer also during map viewpoint change or animation
                });
            };
        }
    }


}

olLayersFactory.register(GEO_IMAGE_LAYER_ID, (config) => {
    return new OLGeoImageLayer(config);
});
