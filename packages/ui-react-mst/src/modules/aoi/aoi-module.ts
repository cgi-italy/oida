import { autorun } from 'mobx';
import { types, addDisposer, SnapshotIn, Instance } from 'mobx-state-tree';

import { FeatureLayer, hasConfig } from '@oida/state-mst';
import { AOI, AOICollection, AoiSourceCollection, AoiSource } from './types';
import { MapModuleStateModel, DefaultMapModule } from '../map';

import { AppModule, AppModuleStateModel } from '../app-module';

export type AoiParser = (input: string | File) => Promise<SnapshotIn<typeof AOI>[]>;

export type AoiModuleConfig = {
    aoiParsers?: Array<{
        id: string;
        name?: string;
        supportedFileTypes: string[];
        parse: AoiParser;
    }>;
};

const AoiModuleStateModelDecl = AppModuleStateModel.addModel(
    types.compose('AoiModule',
        types.model('AoiModule', {
            aois: AOICollection,
            aoiSources: types.optional(AoiSourceCollection, {}),
            activeSource: types.optional(types.safeReference(AoiSource), undefined),
            mapModule: types.reference(MapModuleStateModel)
        }),
        hasConfig<AoiModuleConfig>()
    )
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


type AoiModuleStateModelType = typeof AoiModuleStateModelDecl;
export interface AoiModuleStateModelInterface extends AoiModuleStateModelType {}
export const AoiModuleStateModel: AoiModuleStateModelInterface = AoiModuleStateModelDecl;
export interface IAoiModule extends Instance<AoiModuleStateModelInterface> {}

export type AoiModule = AppModule<typeof AoiModuleStateModel>;

export const DefaultAoiModule : AoiModule = {
    stateModel: AoiModuleStateModel,
    defaultInitState: {
        id: 'aoi',
        mapModule: DefaultMapModule.defaultInitState.id,
        aois: {
            id: 'aois'
        },
        config: {}
    }
};
