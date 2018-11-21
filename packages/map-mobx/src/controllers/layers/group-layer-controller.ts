import { GROUP_LAYER_ID, IGroupLayerRenderer, IMapRenderer } from '@cgi-eo/map-core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { MapEntityCollectionTracker } from '../../utils';

import { IGroupLayer } from '../../types/layers/group-layer';

export class GroupLayerController extends MapLayerController<IGroupLayerRenderer, IGroupLayer> {

    private mapRenderer_: IMapRenderer = null;
    private mapEntityCollectionTracker_: MapEntityCollectionTracker<MapLayerController<IGroupLayerRenderer, IGroupLayer>>;

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

        this.mapEntityCollectionTracker_ = new MapEntityCollectionTracker({
            collection: this.mapLayer_.children,
            onEntityAdd: this.createChildLayer_.bind(this),
            onEntityRemove: this.destroyChildLayer_.bind(this)
        });

    }

    protected unbindFromLayerState_() {
        super.unbindFromLayerState_();
        this.mapEntityCollectionTracker_.destroy();
        delete this.mapEntityCollectionTracker_;
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
