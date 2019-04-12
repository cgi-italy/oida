
import { types } from 'mobx-state-tree';

//imported to avoid an issue with generated typings declaration
//import { IFeatureStyle } from '@oida/core';

import { FeatureLayer } from '@oida/state-mst';
import { AOICollection } from './types/aoi';
import { MapModuleStateModel, DefaultMapModule } from '../map';

import { AppModule, AppModuleStateModel } from '../app-module';

export const AoiModuleStateModel = AppModuleStateModel.addModel(
    types.model('AoiModule', {
        aois: AOICollection,
        mapModule: types.reference(MapModuleStateModel)
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
    })
);

export type AoiModuleConfig = {
};

export type AoiModule = AppModule<typeof AoiModuleStateModel, AoiModuleConfig>;

export const DefaultAoiModule : AoiModule = {
    stateModel: AoiModuleStateModel,
    defaultInitState: {
        id: 'aoi',
        mapModule: DefaultMapModule.defaultInitState.id,
        aois: {
            id: 'aois'
        }
    }
};
