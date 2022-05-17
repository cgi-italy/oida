import axios from 'axios';
import { fromArrayBuffer, TypedArray } from 'geotiff';
import ecStats from 'echarts-stat';
import getBBox from '@turf/bbox';

import { AxiosInstanceWithCancellation, NUMERIC_FIELD_ID, STRING_FIELD_ID, urlParamsSerializer } from '@oidajs/core';
import {
    DatasetAreaValuesData,
    DatasetAreaValuesProvider,
    DistributionHistogramBin,
    DistributionPercentile,
    isDomainProvider,
    isValueDomain,
    NumericDomain,
    NumericVariable
} from '@oidajs/eo-mobx';

import { WcsService } from './wcs-service';

/** Configuration for the {@Link createWcsStatsProvider} function */
export type WcsStatsProviderConfig = {
    /** The wcs service where the dataset coverage is exposed */
    wcsService: WcsService;
    /** The dataset coverage id */
    coverageId: string;
    /** The dataset bands configuration */
    bands: NumericVariable[];
    /** The axios instance used to retrieve the coverage. If not provided a default one will be used */
    axiosInstance?: AxiosInstanceWithCancellation;
};

/**
 * Extract some statistics from a geotiff band
 *
 * @param data The raw geotiff data as an ArrayBuffer
 * @param options optional configuration
 * @param options.bandConfig additional band information (e.g. used for reserved value filtering or domain rescaling)
 * @param options.bandIndex the index of the band from which the statistics will be computed (first band by default)
 * @param options.disableHistogram disable histogram computation
 * @param options.disablePecentiles disable percentiles computation
 * @return the geotiff band statistics
 */
export const extractStatisticsFromTiffData = (
    data: ArrayBuffer,
    options?: {
        bandIndex?: number;
        bandConfig?: NumericVariable;
        disableHistogram?: boolean;
        disablePercentiles?: boolean;
    }
): Promise<DatasetAreaValuesData> => {
    return fromArrayBuffer(data).then((tiff) => {
        return tiff.getImage().then((image) => {
            return image.readRasters().then((data) => {
                let noData: number | undefined;
                const gdalNoData = image.getFileDirectory().GDAL_NODATA;
                if (gdalNoData) {
                    noData = parseFloat(gdalNoData);
                }

                const bandIndex = options?.bandIndex || 0;
                if (bandIndex >= data.length) {
                    throw new Error(`Band index out of bounds. Number of bands: ${data.length}. Requested band: ${bandIndex}`);
                }

                let domainPromise: Promise<NumericDomain | undefined>;

                const bandDomain = options?.bandConfig?.domain;
                if (bandDomain) {
                    if (isDomainProvider(bandDomain)) {
                        domainPromise = bandDomain();
                    } else {
                        domainPromise = Promise.resolve(bandDomain);
                    }
                } else {
                    domainPromise = Promise.resolve(undefined);
                }

                return domainPromise.then((domain) => {
                    let reservedValues: Record<number, string> = {};
                    if (domain && isValueDomain(domain) && domain.reservedValues) {
                        reservedValues = domain.reservedValues;
                    }
                    const values = Array.from(data[bandIndex] as ArrayLike<number>)
                        .filter((value: number) => {
                            return value !== noData && reservedValues[value] === undefined && Number.isFinite(value);
                        })
                        .sort((a, b) => a - b);

                    if (!values.length) {
                        throw new Error('No valid data found');
                    }

                    const stats = {
                        min: ecStats.statistics.min(values),
                        max: ecStats.statistics.max(values),
                        mean: ecStats.statistics.mean(values),
                        median: ecStats.statistics.median(values),
                        variance: ecStats.statistics.sampleVariance(values),
                        histogram: options?.disableHistogram
                            ? undefined
                            : (ecStats.histogram(values, 'sturges').data as DistributionHistogramBin[]),
                        percentiles: options?.disablePercentiles
                            ? undefined
                            : ([
                                  [1, ecStats.statistics.quantile(values, 0.01)],
                                  [5, ecStats.statistics.quantile(values, 0.05)],
                                  [10, ecStats.statistics.quantile(values, 0.1)],
                                  [15, ecStats.statistics.quantile(values, 0.15)],
                                  [20, ecStats.statistics.quantile(values, 0.2)],
                                  [25, ecStats.statistics.quantile(values, 0.25)],
                                  [30, ecStats.statistics.quantile(values, 0.3)],
                                  [35, ecStats.statistics.quantile(values, 0.35)],
                                  [40, ecStats.statistics.quantile(values, 0.4)],
                                  [45, ecStats.statistics.quantile(values, 0.45)],
                                  [50, ecStats.statistics.quantile(values, 0.5)],
                                  [55, ecStats.statistics.quantile(values, 0.55)],
                                  [60, ecStats.statistics.quantile(values, 0.6)],
                                  [65, ecStats.statistics.quantile(values, 0.65)],
                                  [70, ecStats.statistics.quantile(values, 0.7)],
                                  [75, ecStats.statistics.quantile(values, 0.75)],
                                  [80, ecStats.statistics.quantile(values, 0.8)],
                                  [85, ecStats.statistics.quantile(values, 0.85)],
                                  [90, ecStats.statistics.quantile(values, 0.9)],
                                  [95, ecStats.statistics.quantile(values, 0.95)],
                                  [99, ecStats.statistics.quantile(values, 0.99)]
                              ] as DistributionPercentile[])
                    };

                    return {
                        stats: stats,
                        gridValues: Array.from(data[bandIndex] as TypedArray)
                    };
                });
            });
        });
    });
};

/**
 * Create a {@Link DatasetStatsProvider} that when invoked will use a GetCoverage request to retrieve
 * the dataset raw data in GeoTiff format over the request BBOX, and will compute some statistics.
 *
 * @param config The input configuration object
 */
export const createWcsStatsProvider = (config: WcsStatsProviderConfig) => {
    const provider: DatasetAreaValuesProvider = (request) => {
        const geometry = request.geometry;
        let bbox: number[] | undefined;
        if (geometry.type === 'BBox') {
            bbox = geometry.bbox;
        } else if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
            bbox = getBBox(geometry);
        }

        if (!bbox) {
            return Promise.reject(new Error('Unsupported geometry'));
        }

        const additionalParameters: Record<string, string> = {};
        request.additionalDatasetFilters?.forEach((item) => {
            if (item.type === STRING_FIELD_ID || item.type === NUMERIC_FIELD_ID) {
                additionalParameters[item.key] = item.value;
            }
        });

        const params: Record<string, string | string[]> = {
            service: 'WCS',
            request: 'GetCoverage',
            version: '2.0.1',
            coverageId: config.coverageId,
            format: 'image/geotiff',
            subsettingcrs: 'http://www.opengis.net/def/crs/EPSG/0/4326',
            ...additionalParameters
        };

        if (config.bands.length > 1) {
            params.rangesubset = request.variable;
        }

        if (request.gridSize) {
            params.scalesize = `i(${request.gridSize[0]}),j(${request.gridSize[1]})`;
        }

        const subset = [`Long(${bbox[0]},${bbox[2]})`, `Lat(${bbox[1]},${bbox[3]})`];

        if (request.dimensionValues?.has('time')) {
            const dt = request.dimensionValues.get('time') as Date;
            subset.push(`time("${dt.toISOString()}")`);
        }

        params.subset = subset;

        return (config.axiosInstance || axios)
            .request<ArrayBuffer>({
                url: config.wcsService.getServiceUrl(),
                responseType: 'arraybuffer',
                params: params,
                paramsSerializer: urlParamsSerializer
            })
            .then((response) => {
                const bandConfig = config.bands.find((band) => band.id === request.variable);
                return extractStatisticsFromTiffData(response.data, {
                    bandConfig: bandConfig
                }).then((coverageData) => {
                    return {
                        stats: request.dataMask.stats ? coverageData.stats : undefined,
                        gridValues: request.dataMask.gridValues ? coverageData.gridValues : undefined
                    };
                });
            });
    };

    return provider;
};
