import { getGeometryExtent } from '@oida/core';
import {
    RasterMapViz, RasterMapVizConfig, RASTER_VIZ_TYPE, RasterBandModeType, RasterBandPreset, RasterBandModePreset,
    DatasetSpatialCoverageProvider
} from '@oida/eo-mobx';

import { WmsLayer } from './wms-client';

import { intersects, getIntersection } from 'ol/extent';
import { transformExtent } from 'ol/proj';

export const createWmsRasterSourceProvider = (
    layer: WmsLayer,
    wmsUrl: string,
    spatialCoverageProvider?: DatasetSpatialCoverageProvider
) => {

    return (rasterView: RasterMapViz) => {

        let params: Record<string, string> = {
            transparent: 'TRUE',
            format: 'image/png'
        };

        if (layer.BoundingBox.find((bbox) => bbox.crs === 'EPSG:404000')) {
            return Promise.resolve(undefined);
        }

        let timeFilter = rasterView.dataset.selectedTime;
        if (timeFilter) {
            if (timeFilter instanceof Date) {
                params.time = timeFilter.toISOString().replace(/\.[^Z]*Z$/, 'Z');
            } else {
                params.time = `${timeFilter.start.toISOString()}/${timeFilter.end.toISOString()}`;
            }
        }

        let style = '';
        const bandMode = rasterView.bandMode.value;
        if (bandMode instanceof RasterBandModePreset) {
            style = bandMode.preset;
        }

        let bbox = layer.BoundingBox[0];
        let extent = Promise.resolve(bbox.extent);
        let crs = bbox.crs;

        if (spatialCoverageProvider) {
            extent = spatialCoverageProvider(rasterView).then((coverageExtent) => {
                if (coverageExtent) {
                    crs = 'EPSG:4326';
                    return coverageExtent;
                } else {
                    return bbox.extent;
                }
            });
        }

        return extent.then((extent) => {
            let aoiFilter = rasterView.dataset.aoiFilter;

            if (aoiFilter && !aoiFilter.props?.fromMapViewport) {
                let aoiExtent = getGeometryExtent(aoiFilter.geometry);
                aoiExtent = transformExtent(aoiExtent, 'EPSG:4326', crs);

                if (!intersects(extent, aoiExtent)) {
                    return Promise.resolve(undefined);
                } else {
                    extent = getIntersection(extent, aoiExtent);
                }
            }

            return Promise.resolve({
                id: 'wms',
                url: wmsUrl,
                layers: layer.Name,
                styles: style,
                srs: crs,
                parameters: params,
                tileGrid: {
                    extent: extent,
                    forceUniformResolution: true
                }
            });
        });
    };
};

export const getWmsLayerRasterView = (layer: WmsLayer, wmsUrl: string, spatialCoverageProvider?: DatasetSpatialCoverageProvider) => {

    let dimensions = layer.Dimension;
    if (dimensions) {
        dimensions.filter(dimension => dimension.name !== 'time').map((dimension) => {
            //TODO: map to dataset dimensions
        });
    }

    const presets: RasterBandPreset[] = layer.Style?.map((style) => {
        return {
            id: style.Name,
            name: style.Title || style.Name,
            description: style.Abstract,
            preview: style.LegendURL[0].OnlineResource
        };
    }) || [{
        id: 'default',
        name: 'Default',
        preview: ''
    }];

    let rasterVizConfig: RasterMapVizConfig = {
        rasterSourceProvider: createWmsRasterSourceProvider(layer, wmsUrl, spatialCoverageProvider),
        bandMode: {
            supportedModes: [{
                type: RasterBandModeType.Preset,
                default: {
                    preset: presets[0].id
                }
            }],
            presets: presets
        }
    };

    return {
        type: RASTER_VIZ_TYPE,
        props: {
            config: rasterVizConfig
        }
    };
};
