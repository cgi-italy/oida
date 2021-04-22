import { getGeometryExtent, TileSource } from '@oida/core';
import {
    RasterMapViz, RasterMapVizConfig, RASTER_VIZ_TYPE, RasterBandModeType, RasterBandPreset, RasterBandModePreset,
    DatasetSpatialCoverageProvider,
    DatasetMapViewConfig
} from '@oida/eo-mobx';

import { WmsLayer } from './wms-client';

import { intersects, getIntersection } from 'ol/extent';
import { transformExtent } from 'ol/proj';

export const createWmsRasterSourceProvider = (
    layer: WmsLayer,
    wmsUrl: string,
    wmsVersion: string,
    spatialCoverageProvider?: DatasetSpatialCoverageProvider
) => {

    return (rasterView: RasterMapViz) => {

        let params: Record<string, string> = {
            transparent: 'TRUE',
            format: 'image/png',
            styles: ''
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

        const bandMode = rasterView.bandMode.value;
        if (bandMode instanceof RasterBandModePreset) {
            params.styles = bandMode.preset;
        }

        let bbox = layer.BoundingBox[0];
        let extent = Promise.resolve(bbox.extent);
        let crs = bbox.crs;

        //WMS 1.3.0 use lat lon ordering for EPSG:4326
        if (crs === 'EPSG:4326' && wmsVersion === '1.3.0') {
            extent = Promise.resolve([bbox.extent[1], bbox.extent[0], bbox.extent[3], bbox.extent[2]]);
        }

        if (spatialCoverageProvider) {
            extent = spatialCoverageProvider(rasterView).then((coverageExtent) => {
                if (coverageExtent) {
                    crs = 'EPSG:4326';
                    return coverageExtent;
                } else {
                    return extent;
                }
            });
        }

        const aoiFilter = rasterView.dataset.aoiFilter;

        return extent.then((extent) => {

            if (aoiFilter && !aoiFilter.props?.fromMapViewport) {
                let aoiExtent = getGeometryExtent(aoiFilter.geometry);
                aoiExtent = transformExtent(aoiExtent, 'EPSG:4326', crs);

                if (!intersects(extent, aoiExtent)) {
                    return Promise.resolve(undefined);
                } else {
                    extent = getIntersection(extent, aoiExtent);
                }
            }

            let geographicExtent;
            if (crs !== 'EPSG:4326') {
                geographicExtent = transformExtent(extent, crs, 'EPSG:4326');
            } else {
                geographicExtent = extent;
            }

            return Promise.resolve({
                config: {
                    id: 'wms',
                    url: wmsUrl,
                    layers: layer.Name,
                    srs: crs,
                    parameters: params,
                    tileGrid: {
                        extent: extent,
                        forceUniformResolution: true
                    }
                } as TileSource,
                geographicExtent: geographicExtent
            });
        });
    };
};

export const getWmsLayerRasterView = (
    layer: WmsLayer,
    wmsUrl: string,
    wmsVersion: string,
    spatialCoverageProvider?: DatasetSpatialCoverageProvider
) => {

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
        rasterSourceProvider: createWmsRasterSourceProvider(layer, wmsUrl, wmsVersion, spatialCoverageProvider),
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
        config: rasterVizConfig
    } as DatasetMapViewConfig<typeof RASTER_VIZ_TYPE>;
};
