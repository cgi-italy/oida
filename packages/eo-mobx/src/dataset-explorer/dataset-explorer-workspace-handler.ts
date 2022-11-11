import { action, makeObservable, observable } from 'mobx';

import { AoiValue, DateRangeValue, ImageExportOptions, IMapProjection, TileSource } from '@oidajs/core';
import { Map, MapViewportProps, TileLayer } from '@oidajs/state-mobx';

import { DatasetConfig, DatasetConfigJSON } from '../common';
import { datasetConfigFactory } from '../utils';
import { DatasetExplorer, DatasetExplorerItemInitialState } from './dataset-explorer';
import { DatasetExplorerWorkspaceProvider } from './dataset-explorer-workspace-provider';
import { DatasetAnalysis, DatasetAnalysisSnapshot } from '../dataset-analytics';

export type DatasetExplorerWorkspaceConfig = {
    projection: string;
    baseLayer: string;
    renderer: string;
    viewport: MapViewportProps;
    datasets: {
        config: DatasetConfigJSON;
        mapViewSnapshot?: any;
    }[];
    analytics: {
        analyses: DatasetAnalysisSnapshot[];
    };
    aoi?: AoiValue;
    toi?: Date | DateRangeValue;
};

export type DatasetExplorerWorkspace = {
    id: number;
    provider: string;
    name: string;
    description?: string;
    preview?: string;
    config: DatasetExplorerWorkspaceConfig;
};

export type DatasetExplorerWorkspaceHandlerConfig = {
    datasetExplorer: DatasetExplorer;
    map: Map;
    providers: DatasetExplorerWorkspaceProvider[];
    mapBaseLayers: Array<{ id: string; source: TileSource }>;
    mapProjections: IMapProjection[];
    mapRenderers: Array<{ id: string; options?: any }>;
};

export class DatasetExplorerWorkspaceHandler {
    readonly datasetExplorer: DatasetExplorer;
    readonly map: Map;
    readonly providers: DatasetExplorerWorkspaceProvider[];
    @observable.ref currentWorkspace: DatasetExplorerWorkspace | undefined;
    @observable.ref selectedProvider: DatasetExplorerWorkspaceProvider | undefined;

    protected readonly mapBaseLayers_: Array<{ id: string; source: TileSource }>;
    protected readonly mapProjections_: IMapProjection[];
    protected readonly mapRenderers_: Array<{ id: string; options?: any }>;

    constructor(config: DatasetExplorerWorkspaceHandlerConfig) {
        this.datasetExplorer = config.datasetExplorer;
        this.map = config.map;
        this.providers = config.providers;
        this.currentWorkspace = undefined;
        this.selectedProvider = undefined;

        this.mapBaseLayers_ = config.mapBaseLayers;
        this.mapProjections_ = config.mapProjections;
        this.mapRenderers_ = config.mapRenderers;

        makeObservable(this);
    }

    @action
    createEmptyWorkspace() {
        this.datasetExplorer.clearDatasets();
        this.currentWorkspace = undefined;
    }

    @action
    selectProvider(provider: DatasetExplorerWorkspaceProvider | string | undefined) {
        const providerInstance = typeof provider === 'string' ? this.getProvider(provider) : provider;
        if (this.selectedProvider) {
            this.selectedProvider.setActive(false);
        }
        this.selectedProvider = providerInstance;
        if (providerInstance) {
            providerInstance.setActive(true);
        }
    }

    @action
    setCurrentWorkspace(workspace: DatasetExplorerWorkspace | undefined) {
        this.currentWorkspace = workspace;
    }

    getProvider(id: string) {
        return this.providers.find((provider) => provider.id === id);
    }

    get storageProviders() {
        return this.providers.filter((provider) => provider.isSaveSupported());
    }

    canUpdateCurrentWorkspace() {
        if (!this.currentWorkspace) {
            return false;
        }
        return this.getProvider(this.currentWorkspace.provider)?.isSaveSupported() || false;
    }

    updateCurrentWorkspace() {
        if (!this.currentWorkspace) {
            throw new Error('No workspace currently loaded');
        }
        const provider = this.getProvider(this.currentWorkspace.provider);
        if (!provider?.isSaveSupported()) {
            throw new Error('Update not supported for current workspace provider');
        }

        const updatedWorkspace = {
            ...this.currentWorkspace,
            config: this.getCurrentWorkspaceConfig()
        };

        return this.getCurrentWorkspacePreview().then((preview) => {
            updatedWorkspace.preview = preview;
            return provider.updateWorkspace(updatedWorkspace).then(() => {
                this.setCurrentWorkspace(updatedWorkspace);
            });
        });
    }

    renameCurrentWorkspace(name: string) {
        if (!this.currentWorkspace) {
            throw new Error('No workspace currently loaded');
        }
        const provider = this.getProvider(this.currentWorkspace.provider);
        if (!provider?.isSaveSupported()) {
            throw new Error('Update not supported for current workspace provider');
        }

        const updatedWorkspace = {
            ...this.currentWorkspace,
            name: name
        };

        return provider.updateWorkspace(updatedWorkspace).then(() => {
            this.setCurrentWorkspace(updatedWorkspace);
        });
    }

    getCurrentWorkspaceConfig(): DatasetExplorerWorkspaceConfig {
        const datasets = this.datasetExplorer.items.map((item) => {
            return {
                config: item.dataset.config.factoryInit as DatasetConfigJSON,
                mapViewSnapshot: item.mapViz?.getSnapshot()
            };
        });

        return {
            datasets: datasets,
            analytics: this.datasetExplorer.analytics.getSnapshot(),
            toi: this.datasetExplorer.toi,
            aoi: this.datasetExplorer.aoi,
            baseLayer: this.map.layers.children.itemAt(0).name,
            projection: this.map.view.projection.code,
            renderer: this.map.renderer.id,
            viewport: {
                center: this.map.view.viewport.center,
                resolution: this.map.view.viewport.resolution,
                pitch: this.map.view.viewport.pitch,
                rotation: this.map.view.viewport.rotation
            }
        };
    }

    getCurrentWorkspacePreview(options?: ImageExportOptions) {
        return (
            this.map.renderer.implementation?.export(
                options || {
                    width: 128,
                    format: 'image/jpeg',
                    quality: 0.5
                }
            ) || Promise.resolve(undefined)
        );
    }

    setWorkspaceConfig(config: DatasetExplorerWorkspaceConfig) {
        this.datasetExplorer.clearDatasets();

        const datasetConfigPromises: Promise<{
            datasetConfig: DatasetConfig;
            initialState: DatasetExplorerItemInitialState;
        }>[] = [];
        config.datasets.forEach((dataset) => {
            const { config, mapViewSnapshot } = dataset;
            const { factoryType, initConfig } = config;
            const datasetConfigPromise = datasetConfigFactory.create(factoryType, initConfig)?.then((datasetConfig) => {
                const { initialState, ...config } = datasetConfig;
                return {
                    datasetConfig: {
                        ...config,
                        name: mapViewSnapshot.name
                    },
                    initialState: {
                        ...initialState,
                        mapViz: mapViewSnapshot
                    }
                };
            });
            if (datasetConfigPromise) {
                datasetConfigPromises.push(datasetConfigPromise);
            }
        });

        return Promise.allSettled(datasetConfigPromises).then((promises) => {
            this.datasetExplorer.setToi(config.toi);
            this.datasetExplorer.setAoi(config.aoi);

            const renderer = this.mapRenderers_.find((renderer) => renderer.id === config.renderer);
            if (renderer) {
                this.map.setRenderer(renderer);
            }
            const projection = this.mapProjections_.find((projection) => projection.code === config.projection);
            if (projection) {
                this.map.view.setProjection(projection);
            }
            const baseLayerConfig = this.mapBaseLayers_.find((baseLayer) => baseLayer.id === config.baseLayer);
            if (baseLayerConfig) {
                const baseLayer = this.map.layers.children.itemAt(0);
                if (baseLayer instanceof TileLayer) {
                    baseLayer.setSource(baseLayerConfig.source);
                    baseLayer.setName(baseLayerConfig.id);
                }
            }
            this.map.view.setViewport(config.viewport);

            promises.forEach((promise) => {
                if (promise.status === 'fulfilled') {
                    const { datasetConfig, initialState } = promise.value;
                    this.datasetExplorer.addDataset(datasetConfig, initialState);
                }
            });

            config.analytics.analyses.forEach((analysisSnapshot) => {
                if (this.datasetExplorer.analytics.analyses.has(analysisSnapshot.id)) {
                    const analysis = this.datasetExplorer.analytics.analyses.get(analysisSnapshot.id);
                    analysis?.applySnapshot(analysisSnapshot);
                } else {
                    try {
                        const analysis = DatasetAnalysis.createFromSnapshot(analysisSnapshot);
                        this.datasetExplorer.analytics.addAnalysis(analysis);
                    } catch (e) {
                        console.warn(`Skipping analysis: ${e}`);
                    }
                }
            });
        });
    }
}
