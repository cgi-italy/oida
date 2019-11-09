import { IDatasetRasterViz } from '../raster-map-viz';

export type WmsRasterSourceProviderConfig = {
    wmsUrl: string;
    getWmsParams: (rasterViz: IDatasetRasterViz) => {[x: string]: string}
};

export const createWmsRasterSourceProvider = (config: WmsRasterSourceProviderConfig) => {

    let { wmsUrl, getWmsParams } = config;

    return (rasterView: IDatasetRasterViz) => {
        return {
            id: 'wms',
            url: wmsUrl,
            ...getWmsParams(rasterView)
        };
    };
};
