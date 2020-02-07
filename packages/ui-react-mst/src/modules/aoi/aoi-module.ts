import { autorun } from 'mobx';
import { types, addDisposer, SnapshotIn } from 'mobx-state-tree';

import { FeatureLayer, IndexedCollection } from '@oida/state-mst';
import { AOI, AOICollection, AoiSource } from './types';
import { MapModuleStateModel, DefaultMapModule } from '../map';

import { AppModule, AppModuleStateModel } from '../app-module';

export const AoiModuleStateModel = AppModuleStateModel.addModel(
    types.model('AoiModule', {
        aois: AOICollection,
        aoiSources: types.optional(IndexedCollection(AoiSource), {}),
        activeSource: types.optional(types.safeReference(AoiSource), undefined),
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
            setActiveSource: (aoiSource?) => {
                self.activeSource = aoiSource;
            },
            afterAttach: () => {
                let aoiLayer = FeatureLayer.create({
                    id: 'aoiLayer',
                    source: self.aois.id,
                    config: {}
                });
                self.map.layers.children.add(aoiLayer);

                let aoiSourceUpdateDisposer = autorun(() => {
                    if (!self.activeSource) {
                        aoiLayer.setSource(self.aois.id);
                    } else {
                        aoiLayer.setSource(self.activeSource.aois.id);
                    }
                });

                addDisposer(self, aoiSourceUpdateDisposer);

            },
            beforeDetach: () => {
                self.map.layers.children.removeItemWithId('aoiLayer');
            }
        };
    })
);

export type AoiParser = (input: string | File) => Promise<SnapshotIn<typeof AOI>[]>;

export type AoiModuleConfig = {
    aoiParsers?: Array<{
        id: string;
        name?: string;
        supportedFileTypes: string[];
        parse: AoiParser;
    }>;
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
