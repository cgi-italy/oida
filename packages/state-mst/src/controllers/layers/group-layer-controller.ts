import { GROUP_LAYER_ID, IGroupLayerRenderer, IMapRenderer } from '@oida/core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { ArrayTracker } from '../../utils';

import { IGroupLayer } from '../../types/layers/group-layer';

export class GroupLayerController extends MapLayerController<IGroupLayerRenderer, IGroupLayer> {

    private mapRenderer_: IMapRenderer = null;
    private layersTracker_: ArrayTracker<MapLayerController<IGroupLayerRenderer, IGroupLayer>>;

    constructor(config) {
        super(config);
    }

    setMapRenderer(mapRenderer) {
        this.mapRenderer_ = mapRenderer;
        super.setMapRenderer(mapRenderer);
    }

    protected createLayerRenderer_(mapRenderer: IMapRenderer) {
        return <IGroupLayerRenderer>mapRenderer.getLayersFactory().create(GROUP_LAYER_ID, {
            mapRenderer: mapRenderer
        });
    }

    protected bindToLayerState_() {
        super.bindToLayerState_();

        this.layersTracker_ = new ArrayTracker({
            items: this.mapLayer_.children.items,
            onItemAdd: this.createChildLayer_.bind(this),
            onItemRemove: this.destroyChildLayer_.bind(this)
        });

    }

    protected unbindFromLayerState_() {
        super.unbindFromLayerState_();
        this.layersTracker_.destroy();
        delete this.layersTracker_;
    }

    protected createChildLayer_(mapLayer, idx?: number) {
        let childLayerController = layerControllersFactory.create(mapLayer.layerType, {
            mapLayer
        });
        childLayerController.setMapRenderer(this.mapRenderer_);
        let childLayerRenderer = childLayerController.getLayerRenderer();
        if (childLayerRenderer) {
            this.layerRenderer_.addLayer(childLayerRenderer, idx);
        }
        return childLayerController;
    }

    protected destroyChildLayer_(childLayerController: MapLayerController<IGroupLayerRenderer, IGroupLayer>) {
        let childLayerRenderer = childLayerController.getLayerRenderer();
        if (childLayerRenderer) {
            this.layerRenderer_.removeLayer(childLayerRenderer);
        }
        childLayerController.destroy();
    }

}

layerControllersFactory.register(GROUP_LAYER_ID, (config) => {
    return new GroupLayerController(config);
});
