import { v4 as uuid } from 'uuid';
import { autorun } from 'mobx';
import download from 'downloadjs';
import { transformExtent } from 'ol/proj';

import { createAxiosInstance, AxiosInstanceWithCancellation, TileSource, NUMERIC_FIELD_ID } from '@oidajs/core';
import { TileLayer } from '@oidajs/state-mobx';
import { GeotiffRenderer, getPlottyColorScales } from '@oidajs/eo-geotiff';
import {
    DatasetConfig,
    DatasetMapViewConfig,
    DatasetViz,
    DownloaMapVizRequest,
    RasterBandMode,
    RasterBandModeSingle,
    RasterBandModeType,
    RasterMapViz,
    RasterMapVizConfig,
    RASTER_VIZ_TYPE
} from '@oidajs/eo-mobx';

import { AdamGranuleConfig } from './adam-granule-config';
import { ADAM_WCS_SOURCE_ID } from './map-view';
import { AdamSpatialCoverageProvider } from './get-adam-dataset-spatial-coverage-provider';
import { AdamServiceParamsSerializer, createGeoTiffLoader, GeotiffLoader, getAoiWcsParams, getColormapWcsParams } from './utils';
import { AdamDatasetDownloadConfig } from './download';

export const getGranuleCoverageWcsParams = (granuleConfig: AdamGranuleConfig, bandMode: RasterBandMode) => {
    if (bandMode.value instanceof RasterBandModeSingle) {
        const subdatasetId = bandMode.value.band;
        const subdataset = granuleConfig.subdatasets.find((subdataset) => subdataset.id === subdatasetId);
        if (subdataset) {
            const { subset, ...otherWcsParams } = subdataset.wcsParams;
            return {
                wcsUrl: subdataset.wcsUrl,
                coverage: subdataset.wcsCoverage,
                wcsParams: otherWcsParams,
                subsets: Array.isArray(subset) ? subset : [subset]
            };
        }
    }
};

export const getAdamGranuleSpatialCoverageProvider = (
    geotiffRenderer: GeotiffRenderer,
    granuleConfig: AdamGranuleConfig
): AdamSpatialCoverageProvider => {
    return (mapView: DatasetViz<string, any>, keepDatasetSrs?: boolean) => {
        if (mapView instanceof RasterMapViz) {
            // the coverage extent defined in the metadata doesn't consider the filters set on the visualization (e.g. time or scene)
            // use a small GetCoverage, without spatial subsetting, to extract the extent information from the tiff metadata
            let wcsParams: Record<string, string | string[]> = {
                service: 'WCS',
                request: 'GetCoverage',
                version: '2.0.0',
                format: 'image/tiff',
                size: '(32,32)'
            };

            let wcsUrl: string | undefined;
            const subsets: string[] = [];

            const bandMode = mapView.bandMode;
            if (bandMode.value instanceof RasterBandModeSingle) {
                const subdatasetId = bandMode.value.band;
                const subdataset = granuleConfig.subdatasets.find((subdataset) => subdataset.id === subdatasetId);
                if (subdataset) {
                    const { subset, ...otherWcsParams } = subdataset.wcsParams;
                    if (subsets) {
                        if (Array.isArray(subset)) {
                            subsets.push(...subset);
                        } else {
                            subsets.push(subset);
                        }
                    }
                    wcsUrl = subdataset.wcsUrl;
                    wcsParams = {
                        ...wcsParams,
                        coverageId: subdataset.wcsCoverage,
                        ...otherWcsParams
                    };
                }
            }

            const aoiParams = getAoiWcsParams(mapView.dataset.aoi);
            if (aoiParams) {
                subsets.push(...aoiParams.wcsSubsets);
            }

            if (wcsUrl && wcsParams.coverageId) {
                return geotiffRenderer
                    .extractGeotiffExtentFromUrl({
                        url: `${wcsUrl}?${AdamServiceParamsSerializer({
                            ...wcsParams,
                            subset: subsets
                        })}`
                    })
                    .then((extent) => {
                        if (!keepDatasetSrs && extent.srs !== 'EPSG:4326') {
                            const geogExtent = transformExtent(extent.bbox, extent.srs, 'EPSG:4326');
                            return {
                                bbox: geogExtent,
                                srs: 'EPSG:4326'
                            };
                        } else {
                            return extent;
                        }
                    })
                    .catch((error) => {
                        if (!mapView.dataset.aoi) {
                            throw new Error('Unable to retrieve coverage');
                        } else {
                            throw new Error('The layer extent does not intersect the selected area of interest');
                        }
                    });
            } else {
                return Promise.reject(new Error('Unable to retrieve WCS coverage extent'));
            }
        } else {
            return Promise.reject(new Error('Unsupported map visualization type'));
        }
    };
};

export const getAdamGranuleDownloadConfig = (axiosInstance: AxiosInstanceWithCancellation, granuleConfig: AdamGranuleConfig) => {
    const getDownloadRequestConfig = (request: DownloaMapVizRequest) => {
        if (request.datasetViz instanceof RasterMapViz) {
            const params = getGranuleCoverageWcsParams(granuleConfig, request.datasetViz.bandMode);

            if (!params) {
                throw new Error('No coverage available');
            } else {
                const wcsParams: any = {
                    service: 'WCS',
                    request: 'GetCoverage',
                    version: '2.0.0',
                    coverageId: params.coverage,
                    format: request.format,
                    scale: request.options?.scale,
                    ...params.wcsParams
                };

                const subsets = params.subsets;
                if (request.format === 'image/png' || request.format === 'image/gif') {
                    const colorMapParams = getColormapWcsParams(request.datasetViz.bandMode);
                    if (colorMapParams.colorTable) {
                        wcsParams.colortable = colorMapParams.colorTable;
                    }
                    if (colorMapParams.colorRange) {
                        wcsParams.colorrange = colorMapParams.colorRange;
                    }
                }

                const aoiParams = getAoiWcsParams(request.datasetViz.dataset.aoi);
                if (aoiParams) {
                    subsets.push(...aoiParams.wcsSubsets);
                }

                return {
                    url: params.wcsUrl,
                    params: {
                        ...wcsParams,
                        subset: subsets
                    },
                    postData: aoiParams?.wktFilter
                };
            }
        } else {
            throw new Error('Unsupported dataset');
        }
    };

    const downloadUrlProvider = (request: DownloaMapVizRequest) => {
        try {
            const requestConfig = getDownloadRequestConfig(request);
            return Promise.resolve({
                url: `${requestConfig.url}?${AdamServiceParamsSerializer(requestConfig.params)}`,
                postData: requestConfig.postData
            });
        } catch (e) {
            return Promise.reject(e);
        }
    };

    const downloadProvider = (request: DownloaMapVizRequest) => {
        try {
            const requestConfig = getDownloadRequestConfig(request);
            return axiosInstance
                .cancelableRequest({
                    url: requestConfig.url,
                    method: requestConfig.postData ? 'POST' : 'GET',
                    data: requestConfig.postData,
                    params: requestConfig.params,
                    responseType: 'blob',
                    paramsSerializer: {
                        serialize: AdamServiceParamsSerializer
                    }
                })
                .then((response) => {
                    download(response.data, requestConfig.params.coverageId, request.format);
                });
        } catch (e) {
            return Promise.reject(e);
        }
    };

    const downloadConfig: AdamDatasetDownloadConfig = {
        downloadProvider: downloadProvider,
        downloadUrlProvider: downloadUrlProvider,
        supportedFormats: [
            { id: 'image/tiff', name: 'GeoTiff' },
            { id: 'application/tar', name: 'GeoTiff archive' },
            { id: 'image/png', name: 'PNG' },
            { id: 'image/jp2', name: 'Jpeg2000' },
            { id: 'image/gif', name: 'Animated GIF' }
        ],
        supportedOptions: {
            fields: [
                {
                    name: 'scale',
                    title: 'Scale',
                    type: NUMERIC_FIELD_ID,
                    required: true,
                    config: {
                        min: 0.05,
                        max: 1,
                        step: 0.05
                    },
                    rendererConfig: {
                        props: {
                            useSlider: true,
                            sliderProps: {
                                included: true
                            }
                        }
                    }
                }
            ],
            defaultValues: {
                scale: 1
            }
        }
    };

    return downloadConfig;
};

export const createAdamGranuleRasterTileSourceProvider = (
    granuleConfig: AdamGranuleConfig,
    geotiffLoader: GeotiffLoader,
    spatialCoverageProvider: AdamSpatialCoverageProvider
) => {
    const provider = (rasterView: RasterMapViz) => {
        if (granuleConfig.aoiRequired && !rasterView.dataset.aoi) {
            return Promise.reject(new Error('Select an area of interest to visualize data from this layer'));
        }

        const subsets: string[] = [];

        const bandMode = rasterView.bandMode;
        const wcsCoverageParams = getGranuleCoverageWcsParams(granuleConfig, bandMode);
        if (!wcsCoverageParams) {
            return Promise.resolve(undefined);
        }

        subsets.push(...wcsCoverageParams.subsets);

        const aoi = rasterView.dataset.aoi;

        return spatialCoverageProvider(rasterView, true)
            .then((coverageExtent) => {
                if (!coverageExtent) {
                    return Promise.reject(new Error('Error retrieving coverage data'));
                }

                const aoiParams = getAoiWcsParams(aoi, coverageExtent);

                if (!aoiParams) {
                    return Promise.reject(new Error('The layer extent does not intersect the selected area of interest'));
                }

                let geographicExtent;
                if (aoiParams.extent.srs !== 'EPSG:4326') {
                    geographicExtent = transformExtent(aoiParams.extent.bbox, aoiParams.extent.srs, 'EPSG:4326');
                } else {
                    geographicExtent = aoiParams.extent.bbox;
                }

                return {
                    config: {
                        id: ADAM_WCS_SOURCE_ID,
                        url: wcsCoverageParams.wcsUrl,
                        srs: coverageExtent.srs,
                        coverage: wcsCoverageParams.coverage,
                        format: 'image/tiff',
                        subsets: subsets,
                        tileGrid: {
                            extent: coverageExtent.bbox,
                            forceUniformResolution: true,
                            tileSize: 256
                        },
                        crossOrigin: 'anonymous',
                        wktFilter: aoiParams.wktFilter,
                        tileLoadFunction: geotiffLoader.load,
                        otherWcsParams: wcsCoverageParams.wcsParams
                    } as TileSource,
                    geographicExtent: geographicExtent
                };
            })
            .catch((error) => {
                throw error;
            });
    };

    return {
        provider: provider,
        tiffLoader: geotiffLoader
    };
};

export const getAdamGranuleRasterMapViewConfig = (
    geotiffLoader: GeotiffLoader,
    granuleConfig: AdamGranuleConfig,
    spatialCoverageProvider: AdamSpatialCoverageProvider
) => {
    const { provider, tiffLoader } = createAdamGranuleRasterTileSourceProvider(granuleConfig, geotiffLoader, spatialCoverageProvider);

    const afterInit = (mapViz: RasterMapViz) => {
        autorun(
            () => {
                const bandMode = mapViz.bandMode.value;
                if (bandMode?.type === RasterBandModeType.Single) {
                    tiffLoader.renderer.plotty.setColorScale(bandMode.colorMap.colorScale);
                    const domain = bandMode.colorMap.domain;
                    if (domain) {
                        tiffLoader.renderer.plotty.setDomain([domain.mapRange.min, domain.mapRange.max]);
                        tiffLoader.renderer.plotty.setClamp(domain.clamp);
                        tiffLoader.renderer.plotty.setNoDataValue(domain.noDataValue);
                    }

                    mapViz.mapLayer.children.items.forEach((layer) => {
                        (layer as TileLayer).forceRefresh();
                    });
                }
            },
            {
                delay: 1000
            }
        );
    };

    const colorScales = getPlottyColorScales();

    const rasterVizconfig: RasterMapVizConfig = {
        rasterSourceProvider: provider,
        bandMode: {
            supportedModes: [
                {
                    type: RasterBandModeType.Single,
                    default: {
                        band: granuleConfig.subdatasets[0].id
                    }
                }
            ],
            bands: granuleConfig.subdatasets.map((subdataset) => {
                return {
                    colorScales: colorScales,
                    ...subdataset
                };
            }),
            defaultMode: 0
        },
        afterInit: afterInit
    };

    return {
        type: RASTER_VIZ_TYPE,
        config: rasterVizconfig
    } as DatasetMapViewConfig<typeof RASTER_VIZ_TYPE>;
};

export type AdamGranuleFactoryConfig = {
    axiosInstance?: AxiosInstanceWithCancellation;
};

export const getAdamGranuleFactory = (config?: AdamGranuleFactoryConfig) => {
    const axiosInstance = config?.axiosInstance || createAxiosInstance();

    const datasetFactory = (config: AdamGranuleConfig) => {
        const geotiffLoader = createGeoTiffLoader({ axiosInstance, rotateImage: false });

        const spatialCoverageProvider = getAdamGranuleSpatialCoverageProvider(geotiffLoader.renderer, config);

        const datasetConfig: DatasetConfig = {
            id: uuid(),
            name: config.name,
            color: config.color,
            filters: [],
            mapView: getAdamGranuleRasterMapViewConfig(geotiffLoader, config, spatialCoverageProvider),
            tools: [],
            download: getAdamGranuleDownloadConfig(axiosInstance, config),
            spatialCoverageProvider: (mapView) => {
                return spatialCoverageProvider(mapView).then((extent) => {
                    return extent?.bbox;
                });
            }
        };

        return datasetConfig;
    };

    return datasetFactory;
};

export type AdamGranuleFactory = ReturnType<typeof getAdamGranuleFactory>;
