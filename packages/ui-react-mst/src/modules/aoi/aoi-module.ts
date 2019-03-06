
import { types } from 'mobx-state-tree';

import { FeatureLayer } from '@oida/state-mst';
import { AOICollection } from './types/aoi';
import { MapModule, MAP_MODULE_DEFAULT_ID } from '../map';

import { registerAppModule } from '../app-module';

export const AOI_MODULE_DEFAULT_ID = 'aoi';

export const AoiModule = registerAppModule(
    types.model('AoiModule', {
        aois: types.optional(AOICollection, {id: 'aois'}),
        mapModule: types.optional(types.reference(MapModule), MAP_MODULE_DEFAULT_ID)
    })
    .views((self) => {
        return {
            get map() {
                return self.mapModule.map;
            }
        };
    })
    .actions((self) => {
        return {
            afterAttach: () => {
                let aoiLayer = FeatureLayer.create({
                    id: 'aoiLayer',
                    source: self.aois.id,
                    config: {}
                });
                self.map.layers.children.add(aoiLayer);
                aoiLayer.setSource(self.aois.id);
            },
            beforeDetach: () => {
                self.map.layers.children.removeItemWithId('aoiLayer');
            }
        };
    }),
    AOI_MODULE_DEFAULT_ID
);
