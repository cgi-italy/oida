import proj4 from 'proj4';
import { transformExtent } from 'ol/proj';
import { register } from 'ol/proj/proj4';

import { EpsgIoDefinitionProvider } from '@oidajs/core';
import { DatasetSpatialCoverageProvider, DatasetViz } from '@oidajs/eo-mobx';

import { WmtsDomainDiscoveryClient } from './wmts-domain-discovery-client';

export type WmtsDomainSpatialCoverageProviderProps = {
    wmtsUrl: string;
    wmtsLayer: string;
    wmtsDomainDiscoveryClient?: WmtsDomainDiscoveryClient;
};

/**
 * Create a SpatialCoverageProvider using the WMTS multidimensional domain discovery extension.
 * The provider returns the dataset geographic extent for the currently selected time
 */
export const getWmtsDomainSpatialCoverageProvider = (props: WmtsDomainSpatialCoverageProviderProps) => {
    const wmtsDomainDiscoveryClient: WmtsDomainDiscoveryClient = props.wmtsDomainDiscoveryClient || new WmtsDomainDiscoveryClient();

    const srsDefProvider = new EpsgIoDefinitionProvider();

    const spatialCoverageProvider: DatasetSpatialCoverageProvider = (datasetViz: DatasetViz<string, any>) => {
        // retrieve the layer extent for the current dataset selected time
        const toi = datasetViz.dataset.toi;
        let timeRestriction: undefined | string;
        if (toi) {
            if (toi instanceof Date) {
                timeRestriction = toi.toISOString();
            } else {
                timeRestriction = `${toi.start.toISOString()}/${toi.end.toISOString()}`;
            }
        }

        return wmtsDomainDiscoveryClient
            .describeDomains({
                url: props.wmtsUrl,
                layer: props.wmtsLayer,
                tileMatrix: 'EPSG:4326',
                restrictions: timeRestriction
                    ? [
                          {
                              dimension: 'time',
                              range: timeRestriction
                          }
                      ]
                    : undefined
            })
            .then((value) => {
                const bbox = value.bbox;
                if (bbox) {
                    let extent: number[] = [bbox.minx, bbox.miny, bbox.maxx, bbox.maxy];
                    if (bbox.crs !== 'EPSG:4326') {
                        // check if have the projection definition
                        if (proj4.defs(bbox.crs)) {
                            extent = transformExtent(extent, bbox.crs, 'EPSG:4326');
                        } else {
                            // try to retrieve the source projection definition before transforming the extent
                            // to geographic projection
                            return srsDefProvider
                                .getSrsDefinition(bbox.crs)
                                .then((srsDef) => {
                                    if (srsDef) {
                                        proj4.defs(bbox.crs, srsDef);
                                        register(proj4);
                                        extent = transformExtent(extent, bbox.crs, 'EPSG:4326');
                                        return extent;
                                    } else {
                                        return undefined;
                                    }
                                })
                                .catch(() => {
                                    return undefined;
                                });
                        }
                    }
                    return extent;
                }
            });
    };

    return spatialCoverageProvider;
};
