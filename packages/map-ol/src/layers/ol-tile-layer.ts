import TileLayer from 'ol/layer/Tile';
import { olTileSourcesFactory } from './tilesources/ol-tilesources-factory';

import { olLayersFactory } from './ol-layers-factory';
import { OLMapLayer } from './ol-map-layer';

export class OLTileLayer  extends OLMapLayer<TileLayer> {

    constructor(config) {
        super(config);
    }

    updateSource(config) {
        let source = olTileSourcesFactory.create(config.id, {
            ...config,
            wrapX: false
        });

        if (source) {
            this.olImpl_.setSource(source);
        }
    }


    protected createOLObject_(config) {
        return new TileLayer({
            source: olTileSourcesFactory.create(config.source.id, {
                ...config.source,
                wrapX: this.mapRenderer_.getViewer().getView()['wrapX']
            }),
            extent: config.extent,
            zIndex: config.zIndex || 0
        });
    }

    protected destroyOLObject_() {
    }

}

olLayersFactory.register('tile', (config) => {
    return new OLTileLayer(config);
});
