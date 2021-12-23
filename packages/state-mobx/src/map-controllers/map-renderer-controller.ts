import { reaction } from 'mobx';

import { SubscriptionTracker, mapRendererFactory, IMapRenderer, MapCoord } from '@oidajs/core';

import { Map } from '../models/map/map';
import { MapRenderer } from '../models/map/map-renderer';

import { GroupLayerController } from './layers/group-layer-controller';
import { InteractionListController } from './interactions/interaction-list-controller';

export type MapRendererControllerConfig = {
    state: Map;
};

export class MapRendererController {
    private mapState_: Map;
    private mapRenderer_: IMapRenderer | undefined;
    private subscriptionTracker_: SubscriptionTracker = new SubscriptionTracker();
    private layersController_: GroupLayerController;
    private interactionsController_: InteractionListController;
    private ignoreNextViewportChange_ = false;

    constructor(config: MapRendererControllerConfig) {
        this.mapState_ = config.state;

        this.layersController_ = new GroupLayerController({
            mapLayer: this.mapState_.layers
        });

        this.interactionsController_ = new InteractionListController({
            interactions: this.mapState_.interactions.items
        });

        this.bindTMapState_();
    }

    getMapRenderer() {
        return this.mapRenderer_;
    }

    destroy() {
        this.subscriptionTracker_.unsubscribe();
        if (this.mapRenderer_) {
            this.layersController_.destroy();
            this.interactionsController_.destroy();
            this.mapRenderer_.destroy();
        }
    }

    private initMapRenderer_(renderer: MapRenderer) {
        if (this.mapRenderer_) {
            this.layersController_.destroy();
            this.mapRenderer_.destroy();
            delete this.mapRenderer_;
        }
        if (renderer) {
            this.mapRenderer_ = mapRendererFactory.create(renderer.id, {
                target: this.mapState_.view.target,
                viewport: this.mapState_.view.viewport,
                projection: this.mapState_.view.projection,
                onViewUpdating: (optView) => {
                    this.mapState_.view.setUpdating(true);
                    if (optView) {
                        this.updateViewportState_(optView);
                    }
                },
                onViewUpdated: (view) => {
                    this.updateViewportState_(view);
                    this.mapState_.view.setUpdating(false);
                },
                ...renderer.options
            });

            this.layersController_.setMapRenderer(this.mapRenderer_);
            this.interactionsController_.setMapRenderer(this.mapRenderer_);

            if (this.mapRenderer_) {
                const groupRenderer = this.layersController_.getLayerRenderer();
                if (groupRenderer) {
                    this.mapRenderer_.setLayerGroup(groupRenderer);
                }
            }

            this.mapState_.renderer.setImplementation(this.mapRenderer_);
        }
    }

    private bindTMapState_() {
        this.subscriptionTracker_.addSubscription(
            reaction(
                () => {
                    return {
                        projection: this.mapState_.view.projection,
                        renderer: this.mapState_.renderer
                    };
                },
                (config) => {
                    this.initMapRenderer_(config.renderer);
                }
            )
        );

        this.subscriptionTracker_.addSubscription(
            reaction(
                () => this.mapState_.renderer.options,
                (rendererProps) => {
                    if (this.mapRenderer_) {
                        this.mapRenderer_.updateRendererProps(rendererProps);
                    }
                }
            )
        );

        this.subscriptionTracker_.addSubscription(
            reaction(
                () => {
                    return this.mapState_.view.target;
                },
                (target) => {
                    if (target && this.mapRenderer_) {
                        this.mapRenderer_.setTarget(target);
                    }
                }
            )
        );

        this.subscriptionTracker_.addSubscription(
            reaction(
                () => {
                    const viewport = this.mapState_.view.viewport;

                    return {
                        center: <MapCoord>viewport.center.slice(),
                        resolution: viewport.resolution,
                        rotation: viewport.rotation,
                        pitch: viewport.pitch
                    };
                },
                (viewport) => {
                    if (this.ignoreNextViewportChange_) {
                        this.ignoreNextViewportChange_ = false;
                        return;
                    }
                    if (this.mapRenderer_) {
                        this.mapRenderer_.setViewport(viewport, this.mapState_.view.config.value?.animateOnChange);
                    }
                }
            )
        );

        this.initMapRenderer_(this.mapState_.renderer);
    }

    private updateViewportState_(viewport) {
        this.ignoreNextViewportChange_ = true;
        this.mapState_.view.setViewport(viewport);
    }
}
