import length from '@turf/length';

import { AxiosInstanceWithCancellation, createAxiosInstance } from '@oidajs/core';
import { DatasetAreaSeriesRequest, DatasetAreaSeriesDataItem, DatasetTransectValuesRequest } from '@oidajs/eo-mobx';

import { AdamServiceParamsSerializer } from '../utils';
import { AdamDatasetSingleBandCoverage } from '../adam-dataset-config';

export type AdamWpsAnalysisProviderConfig = {
    serviceUrl: string;
    variables: AdamDatasetSingleBandCoverage[];
    axiosInstance?: AxiosInstanceWithCancellation;
};

export class AdamWpsAnalysisProvider {
    protected axiosInstance_: AxiosInstanceWithCancellation;
    protected config_: AdamWpsAnalysisProviderConfig;

    protected domParser_ = new DOMParser();
    protected xmlNamespaces_ = {
        ows: 'http://www.opengis.net/ows/1.1',
        wps: 'http://www.opengis.net/wps/1.0.0'
    };

    constructor(config: AdamWpsAnalysisProviderConfig) {
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.config_ = config;
    }

    getBBoxTimeSeries(request: DatasetAreaSeriesRequest) {
        const wpsParams = {
            service: 'WPS',
            request: 'execute',
            version: '1.0.0',
            identifier: 'stat_values'
        };

        if (request.geometry.type === 'BBox' && request.range && !Array.isArray(request.range) && request.dimension === 'time') {
            const bbox = request.geometry.bbox;

            const variable = this.getVariableConfig_(request.variable);

            const wpsInputs = {
                min_long: bbox[0],
                min_lat: bbox[1],
                max_long: bbox[2],
                max_lat: bbox[3],
                collection: variable?.wcsCoverage,
                timeaggre: 'hour',
                start_time: (request.range.min as Date).toISOString(),
                end_time: (request.range.max as Date).toISOString()
            };

            return this.axiosInstance_
                .cancelableRequest({
                    url: this.config_.serviceUrl,
                    params: {
                        ...wpsParams,
                        datainputs: this.serializeWpsInputs_(wpsInputs)
                    },
                    responseType: 'document',
                    paramsSerializer: {
                        serialize: AdamServiceParamsSerializer
                    }
                })
                .then((response) => {
                    const data = this.parseBBoxTimeSeriesResponse_(response.data);
                    if (data) {
                        const noData = variable?.domain?.noData;
                        if (noData !== undefined) {
                            return data.filter((item) => item.data.stats?.mean !== noData);
                        } else {
                            return data;
                        }
                    } else {
                        throw new Error('Error parsing WPS response');
                    }
                });
        } else {
            return Promise.reject(new Error('Unsupported request'));
        }
    }

    getTransectSeries(request: DatasetTransectValuesRequest) {
        const wpsParams = {
            service: 'WPS',
            request: 'execute',
            version: '1.0.0',
            identifier: 'transect'
        };

        const time = request.dimensionValues?.get('time') as Date | undefined;
        if (!time) {
            return Promise.reject(new Error('No time specified'));
        }

        const coords = request.geometry.coordinates;

        const variable = this.getVariableConfig_(request.variable);
        const wpsInputs = {
            number_points: 10,
            pointa_long: coords[0][0],
            pointa_lat: coords[0][1],
            pointb_long: coords[1][0],
            pointb_lat: coords[1][1],
            collection: variable?.wcsCoverage,
            time_t: time.toISOString()
        };

        return this.axiosInstance_
            .cancelableRequest({
                url: this.config_.serviceUrl,
                params: {
                    ...wpsParams,
                    datainputs: this.serializeWpsInputs_(wpsInputs)
                },
                responseType: 'document',
                paramsSerializer: {
                    serialize: AdamServiceParamsSerializer
                }
            })
            .then((response) => {
                const data = this.parseTransectSeriesResponse_(response.data);
                const line = {
                    type: 'Feature',
                    geometry: request.geometry,
                    properties: {}
                } as GeoJSON.Feature<GeoJSON.LineString>;

                const totalLength = length(line);

                if (data) {
                    const indexToDistance = totalLength / (data.length - 1);
                    const series = data.map((value, index) => {
                        const relativeDistance = index * indexToDistance;
                        return {
                            x: relativeDistance,
                            y: value
                        };
                    });

                    const noData = variable?.domain?.noData;
                    if (noData !== undefined) {
                        return series.filter((item) => item.y !== noData);
                    } else {
                        return series;
                    }
                } else {
                    throw new Error('Error parsing WPS response');
                }
            });
    }

    protected parseBBoxTimeSeriesResponse_(response: XMLDocument) {
        try {
            const processOutput = response.getElementsByTagNameNS(this.xmlNamespaces_['wps'], 'ProcessOutputs')[0];
            const outputs = processOutput.getElementsByTagNameNS(this.xmlNamespaces_['wps'], 'Output');

            const outs: Record<string, (number | string)[]> = {};
            Array.from(outputs).forEach((output) => {
                const id = output.getElementsByTagNameNS(this.xmlNamespaces_['ows'], 'Identifier')[0].textContent;
                const dataString = output.getElementsByTagNameNS(this.xmlNamespaces_['wps'], 'LiteralData')[0].textContent;
                if (id && dataString) {
                    outs[id] = JSON.parse(dataString.replace(/'/g, '"').replace(/nan/g, 'null'));
                }
            });

            return outs['time_array'].map((ts, idx) => {
                return {
                    x: new Date(`${ts}Z`),
                    data: {
                        stats: {
                            min: outs['min_values'][idx],
                            max: outs['max_values'][idx],
                            mean: outs['mean_values'][idx]
                        }
                    }
                };
            }) as DatasetAreaSeriesDataItem[];
        } catch (e) {
            return undefined;
        }
    }

    protected parseTransectSeriesResponse_(response: XMLDocument) {
        try {
            const processOutput = response.getElementsByTagNameNS(this.xmlNamespaces_['wps'], 'ProcessOutputs')[0];
            const output = processOutput.getElementsByTagNameNS(this.xmlNamespaces_['wps'], 'Output')[0];

            const dataString = output.getElementsByTagNameNS(this.xmlNamespaces_['wps'], 'LiteralData')[0].textContent;

            return JSON.parse(dataString!) as number[];
        } catch (e) {
            return undefined;
        }
    }

    protected serializeWpsInputs_(wpsInputs: Record<string, any>) {
        return Object.keys(wpsInputs)
            .map((key) => {
                return `${key}=${wpsInputs[key]}`;
            })
            .join(';');
    }

    protected getVariableConfig_(id: string) {
        return this.config_.variables.find((variable) => variable.id === id);
    }
}
