import { reaction, observable, IObservableValue } from 'mobx';

import { SubscriptionTracker, mapRendererFactory, IMapRenderer, IMapViewport } from '@oida/core';

import { IMap } from '../../types/map/map';

import { GroupLayerController } from '../layers/group-layer-controller';
import { InteractionListController } from '../interactions/interactions-list-controller';

export class MapRendererController {

    private mapState_: IMap;
    private mapRenderer_: IMapRenderer;
    private domTarget_: IObservableValue<HTMLElement>;
    private subscriptionTracker_: SubscriptionTracker = new SubscriptionTracker();
    private layersController_: GroupLayerController;
    private interactionsController_: InteractionListController;
    private ignoreNextViewportChange_: boolean = false;

    constructor(config) {

        this.domTarget_ = observable.box(config.target || null, { deep: false });
        this.mapState_ = config.state;
        this.mapRenderer_ = null;

        this.layersController_ = new GroupLayerController({
            mapLayer: this.mapState_.layers
        });

        this.interactionsController_ = new InteractionListController({
            interactions: this.mapState_.interactions
        });

        this.bindTMapState_();

    }

    setDomTarget(target: HTMLElement) : void {
        if (this.mapRenderer_) {
            this.mapRenderer_.setTarget(target);
        }
        this.domTarget_.set(target);
        this.mapState_.view.setCurrentTarget(target);
    }

    getDomMTarget() : HTMLElement {
        return this.domTarget_.get();
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

    private initMapRenderer_(rendererConfig) {
        if (this.mapRenderer_) {
            this.layersController_.destroy();
            this.mapRenderer_.destroy();
            delete this.mapRenderer_;
        }
        if (rendererConfig) {
            this.mapRenderer_ = mapRendererFactory.create(rendererConfig.id, {
                target: this.domTarget_.get(),
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
                ...rendererConfig.props
            });

            this.layersController_.setMapRenderer(this.mapRenderer_);
            this.interactionsController_.setMapRenderer(this.mapRenderer_);

            if (this.mapRenderer_) {
                this.mapRenderer_.setLayerGroup(this.layersController_.getLayerRenderer());
            }

            this.mapState_.renderer.setImplementation(this.mapRenderer_);

        }

    }

    private bindTMapState_() {
        this.subscriptionTracker_.addSubscription(
            reaction(() => {
                return {
                    projection: this.mapState_.view.projection,
                    renderer: this.mapState_.renderer
                };
            }, (config) => {
                this.initMapRenderer_(config.renderer);
            })
        );

        this.subscriptionTracker_.addSubscription(
            reaction(() => {
                return this.mapState_.view.viewport;
            }, (viewport) => {
                if (this.ignoreNextViewportChange_) {
                    this.ignoreNextViewportChange_ = false;
                    return;
                }
                if (this.mapRenderer_) {
                    this.mapRenderer_.setViewport(<IMapViewport><unknown>viewport, this.mapState_.view.animateOnChange);
                }
            })
        );

        this.initMapRenderer_(this.mapState_.renderer);
    }

    private updateViewportState_(viewport) {
        this.ignoreNextViewportChange_ = true;
        this.mapState_.view.setViewport(viewport);
    }

}
