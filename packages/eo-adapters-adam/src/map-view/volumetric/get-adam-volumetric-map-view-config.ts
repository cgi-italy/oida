import { fromArrayBuffer } from 'geotiff';

import { VolumeSliceUrl } from '@oidajs/core';
import {
    DatasetVolumetricViz, VolumetricMapVizConfig, VOLUMETRIC_VIZ_TYPE, isValueDomain, isDomainProvider, DatasetMapViewConfig
} from '@oidajs/eo-mobx';

import { AdamDatasetConfig, isMultiBandCoverage } from '../../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../../get-adam-dataset-factory';

import { AdamServiceParamsSerializer, getAoiWcsParams, getWcsTimeFilterSubset } from '../../utils';
import { getPlottyColorScales } from '@oidajs/eo-geotiff';

export const getAdamVolumetricMapViewConfig = (
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig
) => {


    const heightDimension = datasetConfig.dimensions
        ? datasetConfig.dimensions.find((dimension) => dimension.id === 'height')
        : undefined;

    if (!heightDimension || !heightDimension.domain || isDomainProvider(heightDimension.domain) || !isValueDomain(heightDimension.domain)) {
        return undefined;
    }

    if (isMultiBandCoverage(datasetConfig.coverages)) {
        return undefined;
    }

    const tileGrid = {
        srs: datasetConfig.coverageSrs,
        numLevels: 1,
        numRootTiles: [2, 1, 1],
        tileSize: [256, 256, 9],
        extent: {
            minX: datasetConfig.coverageExtent[0],
            minY: datasetConfig.coverageExtent[1],
            minZ: heightDimension.domain.min as number,
            maxX: datasetConfig.coverageExtent[2],
            maxY: datasetConfig.coverageExtent[3],
            maxZ: heightDimension.domain.max as number
        }
    };

    const colorScales = getPlottyColorScales();

    const bands = datasetConfig.coverages.map(coverage => {
        return {
            colorScales: colorScales,
            ...coverage
        };
    });

    let volumetricVizConfig: VolumetricMapVizConfig = {
        verticalDomain: {
            step: 1,
            min: heightDimension.domain.min as number,
            max: heightDimension.domain.max as number
        },
        bands: bands,
        volumeSourceProvider: (volumetricViz: DatasetVolumetricViz) => {

            const selectedVariable = volumetricViz.bandMode?.band;

            let variableConfig = bands.find((variable) => {
                return variable.id === selectedVariable;
            });

            const wcsCoverage = variableConfig?.wcsCoverage;

            const sourceSubsets: string[] = [];

            if (!datasetConfig.timeless) {
                const timeSubset = getWcsTimeFilterSubset(volumetricViz.dataset.toi);
                if (timeSubset) {
                    sourceSubsets.push(timeSubset);
                }
            }

            let aoiFilter = volumetricViz.dataset.aoi;

            const aoiParams = getAoiWcsParams(datasetConfig, aoiFilter);

            if (!aoiParams) {
                return undefined;
            }

            const extent = aoiParams?.extent;
            tileGrid.extent.minX = extent[0];
            tileGrid.extent.maxX = extent[2];
            tileGrid.extent.minY = extent[1];
            tileGrid.extent.maxY = extent[3];

            let sizeX = extent[2] - extent[0];
            let sizeY = extent[3] - extent[1];

            if (sizeX >= sizeY) {
                tileGrid.numRootTiles[1] = 1;
                tileGrid.numRootTiles[0] = Math.round(sizeX / sizeY);
            } else {
                tileGrid.numRootTiles[0] = 1;
                tileGrid.numRootTiles[1] = Math.round(sizeY / sizeX);
            }

            return {
                tileGrid: tileGrid,
                tileSliceUrls: (tileKey, tileExtent) => {
                    let wcsParams = {
                        service: 'WCS',
                        request: 'GetCoverage',
                        version: '2.0.0',
                        coverageId: wcsCoverage,
                        format: 'image/tiff',
                        size: `(${tileGrid.tileSize[0]},${tileGrid.tileSize[1]})`
                    };

                    let subsets: string[] = [];
                    subsets.push(`E(${tileExtent.minX},${tileExtent.maxX})`);
                    subsets.push(`N(${tileExtent.minY},${tileExtent.maxY})`);

                    let numSlices = tileGrid.tileSize[2];
                    let z = tileExtent.minZ;
                    let zStep = (tileExtent.maxZ - tileExtent.minZ) / numSlices;
                    let urls: VolumeSliceUrl[] = [];
                    for (let i = 0; i < numSlices; ++i) {

                        let heightSubset = `${heightDimension.wcsSubset.id}(${Math.round(z)})`;
                        let params = AdamServiceParamsSerializer({
                            ...wcsParams,
                            subset: [...sourceSubsets, ...subsets, heightSubset]
                        });

                        urls.push({
                            url: `${factoryConfig.wcsServiceUrl}?${params}`,
                            z: z,
                            postData: aoiParams.wktFilter
                        });

                        z += zStep;
                    }

                    return urls;

                },
                tileSliceLoader: (slice, sliceData) => {
                    return fromArrayBuffer(sliceData).then((tiff) => {
                        return tiff.getImage().then((image) => {
                            return image.readRasters().then((data) => {
                                return data[0];
                            });
                        });
                    });
                }
            };
        }
    };

    return {
        type: VOLUMETRIC_VIZ_TYPE,
        config: volumetricVizConfig
    } as DatasetMapViewConfig<typeof VOLUMETRIC_VIZ_TYPE>;

};

