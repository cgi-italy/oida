import axios from 'axios';
import { fromArrayBuffer } from 'geotiff';
import ecStats from 'echarts-stat';
import getBBox from '@turf/bbox';

import { AxiosInstanceWithCancellation, NUMERIC_FIELD_ID, STRING_FIELD_ID, urlParamsSerializer } from '@oida/core';
import { DatasetAreaValuesProvider, isDomainProvider, isValueDomain, NumericDomain, NumericVariable } from '@oida/eo-mobx';

import { WcsService } from './wcs-service';

/** Configuration for the {@Link createWcsStatsProvider} function */
export type WcsStatsProviderConfig = {
    /** The wcs service where the dataset coverage is exposed */
    wcsService: WcsService,
    /** The dataset coverage id */
    coverageId: string,
    /** The dataset bands configuration */
    bands: NumericVariable[],
    /** The axios instance used to retrieve the coverage. If not provided a default one will be used */
    axiosInstance?: AxiosInstanceWithCancellation
};

/**
 * Extract some statistics from a geotiff band
 *
 * @param data The raw geotiff data as an ArrayBuffer
 * @param options optional configuration
 * @param options.bands additional bands information (e.g. used for reserved value filtering or domain rescaling)
 * @param options.bandId the id of the band from which the statistics will be computed (first band by default)
 * @return the geotiff band statistics
*/
export const extractStatisticsFromTiffData = (data: ArrayBuffer, options?: {bandId: string, bands: NumericVariable[]}) => {
    return fromArrayBuffer(data).then((tiff) => {
        return tiff.getImage().then((image) => {
            return image.readRasters().then((data) => {
                let noData: number | undefined;
                const gdalNoData = image.getFileDirectory().GDAL_NODATA;
                if (gdalNoData) {
                    noData = parseFloat(gdalNoData);
                }

                const bandIndex = options ? options.bands.findIndex((band) => band.id === options.bandId) : 0;
                if (bandIndex === -1 || bandIndex >= data.length) {
                    return undefined;
                }

                let domainPromise: Promise<NumericDomain | undefined>;

                const bandDomain = options ? options.bands[bandIndex].domain : undefined;
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
                    const values = Array.from(data[bandIndex] as ArrayLike<number>).filter((value: number) => {
                        return value !== noData && reservedValues[value] === undefined &&  Number.isFinite(value);
                    }).sort();

                    if (!values.length) {
                        return undefined;
                    }

                    const stats = {
                        min: ecStats.statistics.min(values),
                        max: ecStats.statistics.max(values),
                        mean: ecStats.statistics.mean(values),
                        median: ecStats.statistics.median(values),
                        variance: ecStats.statistics.sampleVariance(values),
                        histogram: ecStats.histogram(values, 'sturges').data
                    };

                    return {
                        stats: stats,
                        gridValues: Array.from(data[bandIndex])
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

        const subset = [
            `Long(${bbox[0]},${bbox[2]})`,
            `Lat(${bbox[1]},${bbox[3]})`
        ];

        if (request.dimensionValues?.has('time')) {
            const dt = request.dimensionValues.get('time') as Date;
            subset.push(`time("${dt.toISOString()}")`);
        }

        params.subset = subset;

        return (config.axiosInstance || axios).request<ArrayBuffer>({
            url: config.wcsService.getServiceUrl(),
            responseType: 'arraybuffer',
            params: params,
            paramsSerializer: urlParamsSerializer
        }).then((response) => {
            const coverageData = extractStatisticsFromTiffData(response.data, {
                bandId: request.variable,
                bands: config.bands
            });

            return {
                stats: request.dataMask.stats ? coverageData.stats : undefined,
                gridValues: request.dataMask.gridValues ? coverageData.gridValues : undefined,
            };
        });
    };

    return provider;
};
