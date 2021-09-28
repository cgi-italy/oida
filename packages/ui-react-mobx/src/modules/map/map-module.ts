import { IMapProjection } from '@oida/core';
import { SelectionManager, Map, MapProps, TileLayer, MapViewportProps } from '@oida/state-mobx';

import { AppModule } from '../app-module';

export const DEFAULT_MAP_MODULE_ID = 'map';

export type MapBaseLayerConfig = {
    id: string,
    name: string,
    config: any
};

export type MapProjectionConfig = IMapProjection & {
    name: string
};

export type MapRendererConfig = {
    id: string,
    name: string,
    options?: any
};

export type MapModuleConfig = {
    baseLayers?: MapBaseLayerConfig[]
    renderers?: MapRendererConfig[],
    projections?: MapProjectionConfig[],
    initialOptions?: {
        baseLayer?: string;
        renderer?: string;
        projection?: string;
        viewport?: MapViewportProps
    }
};

export type MapModuleProps = {
    map: Map | MapProps;
    config: MapModuleConfig;
    selectionManager?: SelectionManager,
    id?: string
};

export class MapModule extends AppModule {
    readonly config: MapModuleConfig;
    readonly selectionManager: SelectionManager;
    readonly map: Map;

    constructor(props: MapModuleProps) {
        super({
            id: props.id || DEFAULT_MAP_MODULE_ID
        });

        this.config = props.config;
        this.selectionManager = props.selectionManager || new SelectionManager();
        this.map = props.map instanceof Map ? props.map : new Map(props.map);

        this.initFromConfig_(props.config);
    }

    protected initFromConfig_(config: MapModuleConfig) {
        if (config.initialOptions) {
            const baseLayerId = config.initialOptions.baseLayer;
            if (baseLayerId) {
                let baseLayers = config.baseLayers || [];
                let baseLayer = baseLayers.find((layer) => {
                    return layer.id === baseLayerId;
                });
                if (baseLayer) {
                    this.map.layers.children.add(
                        new TileLayer({
                            id: baseLayer.id,
                            name: baseLayer.name,
                            source: baseLayer.config
                        })
                    );
                }
            }
            const projectionCode = config.initialOptions.projection;
            if (projectionCode) {
                let projections = config.projections || [];
                let projection = projections.find((projection) => {
                    return projection.code === projectionCode;
                });
                if (projection) {
                    this.map.view.setProjection(projection);
                }
            }
            const rendererId = config.initialOptions.renderer;
            if (rendererId) {
                let renderers = config.renderers || [];
                let renderer = renderers.find((renderer) => {
                    return renderer.id === rendererId;
                });
                if (renderer) {
                    this.map.setRenderer(renderer);
                }
            }
            const viewport = config.initialOptions.viewport;
            if (viewport) {
                this.map.view.setViewport(viewport);
            }
        }
    }
}
