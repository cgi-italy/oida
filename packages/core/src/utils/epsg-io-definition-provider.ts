import { AxiosInstanceWithCancellation, createAxiosInstance } from './create-axios-instance';

export type EpsgIoDefinitionProviderConfig = {
    serviceUrl?: string;
    axiosInstance?: AxiosInstanceWithCancellation;
};

export class EpsgIoDefinitionProvider {

    protected axiosInstance_: AxiosInstanceWithCancellation;
    protected serviceUrl_: string;

    constructor(config?: EpsgIoDefinitionProviderConfig) {
        this.axiosInstance_ = config?.axiosInstance || createAxiosInstance();
        this.serviceUrl_ = config?.serviceUrl || 'https://epsg.io';
    }

    getSrsDefinition(code: string) {
        const defPath = code.toLowerCase().split(':');

        return this.axiosInstance_.request({
            url: `${this.serviceUrl_}`,
            params: {
                format: 'json',
                q: defPath[defPath.length - 1]
            }
        }).then((response) => {
            return response.data.results[0].proj4;
        });
    }
}
