import { WcsClient, WcsVendor } from './wcs-client';

export type WcsServiceConfig = {
    url: string;
    wcsClient: WcsVendor | WcsClient;
};

export class WcsService {
    protected wcsClient_: WcsClient;
    protected config_: WcsServiceConfig;

    constructor(config: WcsServiceConfig) {
        this.wcsClient_ =
            config.wcsClient instanceof WcsClient
                ? config.wcsClient
                : new WcsClient({
                      vendor: config.wcsClient
                  });
        this.config_ = config;
    }

    getServiceUrl() {
        return this.config_.url;
    }

    describeCoverage(coverageId: string) {
        return this.wcsClient_.describeCoverage({
            url: this.config_.url,
            coverageId: coverageId
        });
    }
}
