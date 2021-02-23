
import { AxiosInstanceWithCancellation } from '@oida/core';

import { DatasetVerticalProfileViz, RasterBandModeSingle } from '@oida/eo-mobx';


import { createGeoTiffLoader } from '../../utils';
import { ADAM_WCS_SOURCE_ID } from '../adam-wcs-tile-source';
import { AdamDatasetConfig, isMultiBandCoverage } from '../../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../../get-adam-dataset-factory';
import { AdamWcsVerticalProfileDataProvider } from './adam-wcs-vertical-profile-data-provider';


export const createAdamVerticalProfileTileSourceProvider = (
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig,
    axiosInstance: AxiosInstanceWithCancellation,
    wcsProvider: AdamWcsVerticalProfileDataProvider
) => {

    let geotiffLoader = createGeoTiffLoader({axiosInstance, rotateImage: true});

    let tileSourceProvider = (vProfileViz: DatasetVerticalProfileViz, profileId: string) => {

        let subsets: string[] = [];

        let coverage: string | undefined;

        const bandMode = vProfileViz.bandMode.value;
        if (bandMode instanceof RasterBandModeSingle && !isMultiBandCoverage(datasetConfig.coverages)) {
            const variableConfig = datasetConfig.coverages.find((coverage) => coverage.id === bandMode.band);
            if (variableConfig) {
                coverage = variableConfig.wcsCoverage;
            }
        }

        if (!coverage) {
            return Promise.reject('Unsupported coverage');
        } else {
            return wcsProvider.getProfileMetadata(profileId).then(profile => {

                let extent = [0, 0, profile.dimensions[1], profile.dimensions[0]];

                let timeSubset = `unix(${profile.time.toISOString()})`;

                let extentWidth = extent[2] - extent[0];
                let extentHeight = extent[3] - extent[1];
                let gridSize = extentWidth > extentHeight
                    ? [Math.round(extentWidth / extentHeight), 1]
                    : [1, Math.round(extentHeight / extentWidth)];

                return {
                    id: ADAM_WCS_SOURCE_ID,
                    url: factoryConfig.wcsServiceUrl,
                    srs: 'unprojected',
                    coverage: coverage,
                    format: 'image/tiff',
                    subsets: [...subsets, timeSubset],
                    tileGrid: {
                        extent: extent,
                        gridSize: gridSize
                    },
                    tileLoadFunction: geotiffLoader.load
                };
            });
        }
    };

    return {
        tileSourceProvider,
        geotiffLoader
    };

};
