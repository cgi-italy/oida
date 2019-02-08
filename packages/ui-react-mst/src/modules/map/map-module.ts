
import { types } from 'mobx-state-tree';

import { Map, EntitySelection, ReferenceOrType } from '@oida/state-mst';

import { registerAppModule } from '../app-module';

const defaultInitState = {
    renderer: {
        id: 'ol'
    },
    view: {
        viewport: {
            center: [12.5, 41.9],
            resolution: 2000
        },
        projection: {
            code: 'EPSG:900913'
        }
    },
    layers: {
        id: 'rootLayerGroup',
        children: {
            items: [
                {
                    id: 'base',
                    layerType: 'tile',
                    source: {
                        id: 'osm'
                    }
                }
            ]
        }
    }
};

export const MAP_MODULE_DEFAULT_ID = 'map';

export const MapModule = registerAppModule(
    types.model('MapModule', {
        map: types.optional(Map, defaultInitState),
        selection: types.optional(ReferenceOrType(EntitySelection), {id: 'selection'})
    }), MAP_MODULE_DEFAULT_ID
);
