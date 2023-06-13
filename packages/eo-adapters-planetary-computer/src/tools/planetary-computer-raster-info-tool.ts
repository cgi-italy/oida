import {
    DatasetRasterPointInfoConfig,
    DatasetRasterPointInfoProvider,
    DatasetToolConfig,
    RASTER_POINT_INFO_PRCESSING
} from '@oidajs/eo-mobx';

import { PlanetaryComputerApiClient, PlanetaryComputerCollections } from '../common';

export type PlanetaryComputerRasterInfoProviderConfig = {
    apiClient: PlanetaryComputerApiClient;
    collection: string;
    item: string;
};

export const createPlanetaryComputerRasterInfoProvider = (config: PlanetaryComputerRasterInfoProviderConfig) => {
    const provider: DatasetRasterPointInfoProvider = (request) => {
        return config.apiClient
            .getItemPointInfo({
                collection: config.collection,
                item: config.item,
                location: request.position,
                assets: PlanetaryComputerCollections[config.collection].bands.map((band) => band.id)
            })
            .then((data) => {
                return data.band_names.reduce((info, band, index) => {
                    return {
                        ...info,
                        [band]: data.values[index]
                    };
                }, {});
            });
    };

    return provider;
};

export type PlanetaryComputerRasterInfoConfig = {
    providerConfig: PlanetaryComputerRasterInfoProviderConfig;
};

export const getPlanetaryComputerRasterInfoToolConfig = (props: PlanetaryComputerRasterInfoConfig) => {
    const provider = createPlanetaryComputerRasterInfoProvider(props.providerConfig);

    const rasterInfoToolConfig: DatasetRasterPointInfoConfig = {
        variables: PlanetaryComputerCollections[props.providerConfig.collection].bands,
        dimensions: [],
        provider: provider
    };

    return {
        type: RASTER_POINT_INFO_PRCESSING,
        name: 'Point info',
        config: rasterInfoToolConfig
    } as DatasetToolConfig<typeof RASTER_POINT_INFO_PRCESSING>;
};
