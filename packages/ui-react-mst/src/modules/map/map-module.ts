
import { types, Instance } from 'mobx-state-tree';

import { IMapProjection } from '@oida/core';
import { Map, EntitySelection, TileLayer, ReferenceOrType, hasConfig } from '@oida/state-mst';

import { AppModule, AppModuleStateModel } from '../app-module';
import { FormattersModuleStateModel } from '../formatters';

export type MapModuleConfig = {
    baseLayers?: Array<{id: string, name: string, config: any}>
    renderers?: Array<{id: string, name: string, props?: any}>,
    projections?: Array<IMapProjection & {name: string}>,
    initialOptions?: {
        baseLayer?: string;
        renderer?: string;
        projection?: string;
    }
};

const MapModuleStateModelDecl = AppModuleStateModel.addModel(
    types.compose(
        'MapModule',
        types.model({
            map: Map,
            selection: ReferenceOrType(EntitySelection),
            formattersModule: types.maybe(types.reference(FormattersModuleStateModel))
        }), hasConfig<MapModuleConfig>()
    ).actions((self) => {
        return {
            afterAttach: () => {
                let config = self.config;
                if (config.initialOptions) {
                    let baseLayerId = config.initialOptions.baseLayer;
                    if (baseLayerId) {
                        let baseLayers = config.baseLayers || [];
                        let baseLayer = baseLayers.find((layer) => {
                            return layer.id === baseLayerId;
                        });
                        if (baseLayer) {
                            self.map.layers.children.add(
                                TileLayer.create({
                                    id: 'baseLayer',
                                    name: baseLayer.id,
                                    source: baseLayer.config
                                }), 0
                            );
                        }
                    }
                    let projectionCode = config.initialOptions.projection;
                    if (projectionCode) {
                        let projections = config.projections || [];
                        let projection = projections.find((projection) => {
                            return projection.code === projectionCode;
                        });
                        if (projection) {
                            self.map.view.setProjection(projection);
                        }
                    }
                    let rendererId = config.initialOptions.renderer;
                    if (rendererId) {
                        let renderers = config.renderers || [];
                        let renderer = renderers.find((renderer) => {
                            return renderer.id === rendererId;
                        });
                        if (renderer) {
                            self.map.setRenderer(renderer);
                        }
                    }
                }

            }
        };
    })
);

type MapModuleStateModelType = typeof MapModuleStateModelDecl;
export interface MapModuleStateModelInterface extends MapModuleStateModelType {}
export const MapModuleStateModel: MapModuleStateModelInterface = MapModuleStateModelDecl;
export interface IMapModule extends Instance<MapModuleStateModelInterface> {}

export type MapModule = AppModule<MapModuleStateModelInterface>;

const defaultInitState = {
    id: 'map',
    map: {
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
        }
    },
    selection: {
        id: 'selection'
    },
    config: {}
};

export const DefaultMapModule : MapModule = {
    stateModel: MapModuleStateModel,
    defaultInitState: defaultInitState
};
