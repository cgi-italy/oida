import { AxiosInstanceWithCancellation, createAxiosInstance } from './create-axios-instance';

export type SpatialReferenceOrgDefinitionProviderConfig = {
    serviceUrl?: string;
    axiosInstance?: AxiosInstanceWithCancellation;
};

export class SpatialReferenceOrgDefinitionProvider {

    protected axiosInstance_: AxiosInstanceWithCancellation;
    protected serviceUrl_: string;

    constructor(config?: SpatialReferenceOrgDefinitionProviderConfig) {
        this.axiosInstance_ = config?.axiosInstance || createAxiosInstance();
        this.serviceUrl_ = config?.serviceUrl || 'https://spatialreference.org';
    }

    getSrsDefinition(code: string) {
        const defPath = code.toLowerCase().split(':').join('/');

        return this.axiosInstance_.request<string>({
            url: `${this.serviceUrl_}/ref/${defPath}/proj4/`,
            responseType: 'text/plain'
        }).then((response) => {
            return response.data;
        });
    }
}
