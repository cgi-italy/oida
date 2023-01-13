import { IMapProjection, TileSource } from '@oidajs/core';
import { SelectionManager, Map, MapProps, TileLayer, MapViewportProps } from '@oidajs/state-mobx';

import { AppModule } from '../app-module';

export const DEFAULT_MAP_MODULE_ID = 'map';

export type MapBaseLayerConfig = {
    id: string;
    name: string;
    source: TileSource;
};

export type MapProjectionConfig = IMapProjection & {
    name: string;
};

export type MapRendererConfig = {
    id: string;
    name: string;
    options?: any;
};

export type MapModuleConfig = {
    baseLayers?: MapBaseLayerConfig[];
    renderers?: MapRendererConfig[];
    projections?: MapProjectionConfig[];
    initialOptions?: {
        baseLayer?: string;
        renderer?: string;
        projection?: string;
        viewport?: MapViewportProps;
    };
};

export type MapModuleProps = {
    map: Map | MapProps;
    config: MapModuleConfig;
    selectionManager?: SelectionManager;
    id?: string;
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
                const baseLayers = config.baseLayers || [];
                const baseLayer = baseLayers.find((layer) => {
                    return layer.id === baseLayerId;
                });
                if (baseLayer) {
                    this.map.layers.children.add(
                        new TileLayer({
                            id: 'base_layer',
                            name: baseLayer.id,
                            source: baseLayer.source
                        })
                    );
                }
            }
            const projectionCode = config.initialOptions.projection;
            if (projectionCode) {
                const projections = config.projections || [];
                const projection = projections.find((projection) => {
                    return projection.code === projectionCode;
                });
                if (projection) {
                    this.map.view.setProjection(projection);
                }
            }
            const rendererId = config.initialOptions.renderer;
            if (rendererId) {
                const renderers = config.renderers || [];
                const renderer = renderers.find((renderer) => {
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
