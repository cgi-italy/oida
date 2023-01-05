import { ImageryProvider } from 'cesium';

import { ITileSourceDefinitions } from '@oidajs/core';
import { cesiumTileSourcesFactory, extendImageryProvider, getProjectionType, ProjectionType } from '@oidajs/map-cesium';
import { olTileSourcesFactory, refreshTileSource } from '@oidajs/map-ol';

import { CesiumOLImageryProvider } from './cesium-ol-imagery-provider';

const originalFactoryCreate = cesiumTileSourcesFactory.create;
// we modify the create method of the cesium tile source factory to use openlayers on unsupported source types
cesiumTileSourcesFactory.create = (id: string, config: any) => {
    //use ol tile source for unsupported source types and unsupported projections
    if (!cesiumTileSourcesFactory.isRegistered(id) || (config.srs && getProjectionType(config.srs) === ProjectionType.Other)) {
        const olSource = olTileSourcesFactory.create(id, config);
        if (olSource) {
            const olProvider: ImageryProvider = new CesiumOLImageryProvider(olSource, config);
            const cesiumSource = extendImageryProvider(olProvider, () => {
                refreshTileSource(olSource);
            });
            return cesiumSource;
        }
    } else {
        return originalFactoryCreate(id as keyof ITileSourceDefinitions, config);
    }
};

export * from './cesium-ol-imagery-provider';
