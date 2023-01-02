import { intersects, getIntersection } from 'ol/extent';
import { transformExtent } from 'ol/proj';

import { BBox, getGeometryExtent, NUMERIC_FIELD_ID, QueryFilter, STRING_FIELD_ID, TileGridConfig, TileSource } from '@oidajs/core';
import {
    RasterMapViz,
    RasterMapVizConfig,
    RASTER_VIZ_TYPE,
    RasterBandModeType,
    RasterBandPreset,
    RasterBandModePreset,
    DatasetSpatialCoverageProvider,
    DatasetMapViewConfig
} from '@oidajs/eo-mobx';

import { WmsLayer, WmsLayerStyle } from './wms-client';

export type WmsRasterSourceTileGridOptions = Partial<Omit<TileGridConfig, 'isWMTS' | 'matrixIds'>>;
export type WmsRasterSourceFiltersSerializer = (filters: QueryFilter[]) => Record<string, string>;

export type WmsRasterSourceProviderConfig = {
    /** The WMS layer capabilities object */
    layer: WmsLayer;
    /** The WMS service URL */
    wmsServiceUrl: string;
    /** The WMS service version */
    wmsVersion: string;
    /**
     * The spatial coverage provider. It will be used to initialize the layer source extent
     * If not provided the extent from the capabilities will be used
     */
    spatialCoverageProvider?: DatasetSpatialCoverageProvider;
    /**
     * This function is used to serialize the {@Link Dataset.additionalFilters} as additional WMS request parameters
     * If not provided by default all string and numeric filters will be serialized as key value pairs
     */
    additionalFiltersSerializer?: WmsRasterSourceFiltersSerializer;
    /**
     * The source tile grid options. By default the tile grid is initialized with the extent coming from the spatialCoverageProvider
     */
    tileGridOptions?: WmsRasterSourceTileGridOptions;
};

export const createWmsRasterSourceProvider = (config: WmsRasterSourceProviderConfig) => {
    const isTimeless = !config.layer.Dimension?.find((dimension) => dimension.name === 'time');

    return (rasterView: RasterMapViz) => {
        const params: Record<string, string> = {
            transparent: 'TRUE',
            format: 'image/png',
            styles: ''
        };

        if (config.layer.BoundingBox.find((bbox) => bbox.crs === 'EPSG:404000')) {
            return Promise.resolve(undefined);
        }

        if (!isTimeless) {
            const timeFilter = rasterView.dataset.toi;
            if (timeFilter) {
                if (timeFilter instanceof Date) {
                    params.time = timeFilter.toISOString().replace(/\.[^Z]*Z$/, 'Z');
                } else {
                    params.time = `${timeFilter.start.toISOString()}/${timeFilter.end.toISOString()}`;
                }
            }
        }

        const bandMode = rasterView.bandMode.value;
        if (bandMode instanceof RasterBandModePreset) {
            params.styles = bandMode.preset;
        }

        const bbox = config.layer.BoundingBox[0];
        let extent = Promise.resolve(bbox.extent);
        let crs = bbox.crs;

        //WMS 1.3.0 use lat lon ordering for EPSG:4326
        if (crs === 'EPSG:4326' && config.wmsVersion === '1.3.0') {
            extent = Promise.resolve([bbox.extent[1], bbox.extent[0], bbox.extent[3], bbox.extent[2]]);
        }

        if (config.spatialCoverageProvider) {
            const staticExtent = extent;
            extent = config.spatialCoverageProvider(rasterView).then((coverageExtent) => {
                if (coverageExtent) {
                    crs = 'EPSG:4326';
                    return coverageExtent;
                } else {
                    return staticExtent;
                }
            });
        }

        const aoiFilter = rasterView.dataset.aoi;

        return extent.then((extent) => {
            if (aoiFilter && !aoiFilter.props?.fromMapViewport) {
                let aoiExtent = getGeometryExtent(aoiFilter.geometry);
                if (aoiExtent) {
                    aoiExtent = transformExtent(aoiExtent, 'EPSG:4326', crs) as BBox;
                    if (!intersects(extent, aoiExtent)) {
                        return Promise.resolve(undefined);
                    } else {
                        extent = getIntersection(extent, aoiExtent);
                    }
                }
            }

            let geographicExtent;
            if (crs !== 'EPSG:4326') {
                geographicExtent = transformExtent(extent, crs, 'EPSG:4326');
            } else {
                geographicExtent = extent;
            }

            let additionalParams: Record<string, string> = {};
            if (config.additionalFiltersSerializer) {
                additionalParams = config.additionalFiltersSerializer(rasterView.dataset.additionalFilters.asArray());
            } else {
                // by default serialize all additional string and numeric filters as key value parameters
                rasterView.dataset.additionalFilters.items.forEach((filter) => {
                    if (filter.type === STRING_FIELD_ID || filter.type === NUMERIC_FIELD_ID) {
                        additionalParams[filter.key] = filter.value;
                    }
                });
            }

            return Promise.resolve({
                config: {
                    id: 'wms',
                    url: config.wmsServiceUrl,
                    layers: config.layer.Name,
                    srs: crs,
                    parameters: {
                        ...params,
                        ...additionalParams
                    },
                    tileGrid: {
                        extent: extent,
                        ...config.tileGridOptions
                    }
                } as TileSource,
                geographicExtent: geographicExtent
            });
        });
    };
};

export type WmsLayerRasterViewConfig = WmsRasterSourceProviderConfig & {
    /**
     * By default WMS layer styles are mapped to {@Link RasterBandPreset} using the information
     * obtained from the layer capabilities. It is possible to override any of the default values
     * through this function
     */
    getPresetFromStyle?: (style: WmsLayerStyle) => Partial<RasterBandPreset>;
};

export const getWmsLayerRasterView = (config: WmsLayerRasterViewConfig) => {
    const dimensions = config.layer.Dimension;
    if (dimensions) {
        dimensions
            .filter((dimension) => dimension.name !== 'time')
            .map((dimension) => {
                //TODO: map to dataset dimensions
            });
    }

    const presets: RasterBandPreset[] = config.layer.Style?.map((style) => {
        return {
            id: style.Name,
            name: style.Title || style.Name,
            description: style.Abstract,
            preview: `${style.LegendURL[0].OnlineResource}`,
            legend: `${style.LegendURL[0].OnlineResource}`,
            ...(config.getPresetFromStyle ? config.getPresetFromStyle(style) : undefined)
        };
    }) || [
        {
            id: 'default',
            name: 'Default',
            preview: ''
        }
    ];

    const rasterVizConfig: RasterMapVizConfig = {
        rasterSourceProvider: createWmsRasterSourceProvider(config),
        bandMode: {
            supportedModes: [
                {
                    type: RasterBandModeType.Preset,
                    default: {
                        preset: presets[0].id
                    }
                }
            ],
            presets: presets
        }
    };

    return {
        type: RASTER_VIZ_TYPE,
        config: rasterVizConfig
    } as DatasetMapViewConfig<typeof RASTER_VIZ_TYPE>;
};
