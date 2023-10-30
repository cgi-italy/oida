import { v4 as uuid } from 'uuid';

import { PlanetaryComputerApiClient } from '../common';
import { getPlanetaryComputerItemRasterView } from '../mapview';
import { getPlanetaryComputerRasterInfoToolConfig, getPlanetaryComputerStatsToolConfig } from '../tools';

export const getPlanetaryComputerDatasetConfigForItem = (
    title: string,
    apiClient: PlanetaryComputerApiClient,
    collection: string,
    itemId: string
) => {
    return {
        id: uuid(),
        name: title,
        filters: [],
        mapView: getPlanetaryComputerItemRasterView({
            collection: collection,
            item: itemId,
            apiClient: apiClient
        }),
        tools: [
            getPlanetaryComputerRasterInfoToolConfig({
                providerConfig: {
                    apiClient: apiClient,
                    collection: collection,
                    item: itemId
                }
            }),
            getPlanetaryComputerStatsToolConfig({
                providerConfig: {
                    apiClient: apiClient,
                    collection: collection,
                    item: itemId
                }
            })
        ]
    };
};
