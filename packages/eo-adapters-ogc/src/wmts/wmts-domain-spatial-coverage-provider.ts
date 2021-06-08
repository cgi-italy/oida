import { DateRangeValue } from '@oida/core';
import { DatasetViz } from '@oida/eo-mobx';

import { WmtsDomainDiscoveryClient } from './wmts-domain-discovery-client';

export type WmtsDomainSpatialCoverageProviderProps = {
    wmtsUrl: string;
    wmtsLayer: string;
    wmtsDomainDiscoveryClient?: WmtsDomainDiscoveryClient;
};

export const getWmtsDomainSpatialCoverageProvider = (props: WmtsDomainSpatialCoverageProviderProps) => {
    const wmtsDomainDiscoveryClient: WmtsDomainDiscoveryClient = props.wmtsDomainDiscoveryClient || new WmtsDomainDiscoveryClient();

    return (datasetViz: DatasetViz) => {

        const toi = datasetViz.dataset.toi;
        let timeRestriction: undefined | string;
        if (toi) {
            if (toi instanceof Date) {
                timeRestriction = toi.toISOString();
            } else {
                timeRestriction = `${toi.start.toISOString()}/${toi.end.toISOString()}`;
            }
        }

        return wmtsDomainDiscoveryClient.describeDomains({
            url: props.wmtsUrl,
            layer: props.wmtsLayer,
            tileMatrix: 'EPSG:4326',
            restrictions: timeRestriction ? [{
                dimension: 'time',
                range: timeRestriction
            }] : undefined
        }).then((value) => {
            const bbox = value.bbox;
            if (bbox) {
                return [bbox.minx, bbox.miny, bbox.maxx, bbox.maxy] as number[];
            }
        });
    };

};
