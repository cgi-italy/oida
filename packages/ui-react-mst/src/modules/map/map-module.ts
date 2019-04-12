
import { types } from 'mobx-state-tree';

import { IMapProjection } from '@oida/core';
import { Map, EntitySelection, TileLayer, ReferenceOrType } from '@oida/state-mst';

import { AppModule, AppModuleStateModel } from '../app-module';

import { SelectionMode } from  '@oida/core';

export const MapModuleStateModel = AppModuleStateModel.addModel(
    types.model('map', {
        map: Map,
        selection: ReferenceOrType(EntitySelection)
    }).actions((self) => {
        return {
            afterAttach: () => {
                let config = ((self as any).config as MapModuleConfig);
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

export type MapModuleConfig = {
    baseLayers?: Array<{id: string, name: string, config: any}>
    renderers?: Array<{id: string, props?: any}>,
    projections?: Array<IMapProjection & {name: string}>,
    initialOptions?: {
        baseLayer?: string;
        renderer?: string;
        projection?: string;
    }
};

export type MapModule = AppModule<typeof MapModuleStateModel, MapModuleConfig>;

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
    }
};

export const DefaultMapModule : MapModule = {
    stateModel: MapModuleStateModel,
    defaultInitState: defaultInitState
};
