import { RasterBandConfig } from '@oidajs/eo-mobx';

import { PlanetaryComputerDataParamaters } from './planetary-computer-api-client';
import { PlanetaryComputerLandsatCollection, PLANETARY_COMPUTER_LANDSAT_COLLECTION_ID } from './planetary-computer-landsat-collection';
import { PlanetaryComputerS1CollectionConfig, PLANETARY_COMPUTER_SENTINEL1_COLLECTION_ID } from './planetary-computer-s1-collection';
import { PlanetaryComputerS2CollectionConfig, PLANETARY_COMPUTER_SENTINEL2_COLLECTION_ID } from './planetary-computer-s2-collection';

export type PlanetaryComputerCollectionPreset = {
    id: string;
    name: string;
    dataParameters: PlanetaryComputerDataParamaters;
    legend?: string;
    legendValues?: number[];
    preview?: string;
};

export type PlanetaryComputerCollectionConfig = {
    bands: RasterBandConfig[];
    minZoomLevel?: number;
    presets: Record<string, PlanetaryComputerCollectionPreset>;
};

export const PlanetaryComputerCollections: Record<string, PlanetaryComputerCollectionConfig> = {
    [PLANETARY_COMPUTER_SENTINEL2_COLLECTION_ID]: PlanetaryComputerS2CollectionConfig,
    [PLANETARY_COMPUTER_SENTINEL1_COLLECTION_ID]: PlanetaryComputerS1CollectionConfig,
    [PLANETARY_COMPUTER_LANDSAT_COLLECTION_ID]: PlanetaryComputerLandsatCollection
};
