import { GROUP_LAYER_ID, IGroupLayerRenderer } from '@cgi-eo/map-core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';


export class GroupLayerController extends MapLayerController<IGroupLayerRenderer> {

    private mapRenderer_ = null;
    private childLayersControllers_ : {[key: string]: MapLayerController } = {};

    constructor(config) {
        super(config);
    }

    setMapRenderer(mapRenderer) {
        this.mapRenderer_ = mapRenderer;
        super.setMapRenderer(mapRenderer);
    }

    destroy() {
        if (this.layerRenderer_) {
            for (let id in this.childLayersControllers_) {
                this.destroyChildLayer_(id);
            }
        }
        super.destroy();
    }

    protected createLayerRenderer_(mapRenderer) {
        return mapRenderer.getLayersFactory().create(GROUP_LAYER_ID, {
            mapRenderer: mapRenderer
        });
    }

    protected bindToLayerState_() {
        super.bindToLayerState_();

        this.subscriptionTracker_.addSubscription(this.mapLayer_.children.items.observe((change) => {
            if (change.type === 'splice') {
                let idx = change.index;
                change.added.forEach((mapLayer) => {
                    this.createChildLayer_(mapLayer.value, idx++);
                });

                change.removed.forEach((mapLayer) => {
                    this.destroyChildLayer_(mapLayer.snapshot.id);
                });
            }
        }));

        this.mapLayer_.children.items.forEach((mapLayer) => {
            this.createChildLayer_(mapLayer);
        });

    }

    protected unbindFromLayerState_() {
        super.unbindFromLayerState_();
    }

    protected createChildLayer_(mapLayer, idx?: number) {
        let childLayerController = layerControllersFactory.create(mapLayer.layerType, {
            mapLayer
        });
        this.childLayersControllers_[mapLayer.id] = childLayerController;
        childLayerController.setMapRenderer(this.mapRenderer_);
        let childLayerRenderer = childLayerController.getLayerRenderer();
        if (childLayerRenderer) {
            this.layerRenderer_.addLayer(childLayerRenderer, idx);
        }
    }

    protected destroyChildLayer_(id) {
        let childLayerController = this.childLayersControllers_[id];
        let childLayerRenderer = childLayerController.getLayerRenderer();
        if (childLayerRenderer) {
            this.layerRenderer_.removeLayer(childLayerRenderer);
        }
        childLayerController.destroy();
        delete this.childLayersControllers_[id];
    }

}

layerControllersFactory.register(GROUP_LAYER_ID, (config) => {
    return new GroupLayerController(config);
});
