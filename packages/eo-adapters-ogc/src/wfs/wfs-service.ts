import { WfsClient, WfsClientConfig, WfsGetFeaturesRequest } from './wfs-client';

export type WfsServiceConfig = {
    url: string;
    wfsClient?: WfsClient | WfsClientConfig;
};

export class WfsService {
    protected wfsClient_: WfsClient;
    protected url_: string;

    constructor(config: WfsServiceConfig) {
        this.wfsClient_ = config.wfsClient instanceof WfsClient ? config.wfsClient : new WfsClient(config.wfsClient || {});
        this.url_ = config.url;
    }

    getServiceUrl() {
        return this.url_;
    }

    getFeatures(request: Omit<WfsGetFeaturesRequest, 'serviceUrl'>) {
        return this.wfsClient_.getFeatures({
            serviceUrl: this.url_,
            ...request
        });
    }
}
