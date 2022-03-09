import { cesiumTileSourcesFactory, getProjectionType, ProjectionType } from '@oidajs/map-cesium';
import { olTileSourcesFactory } from '@oidajs/map-ol';

import { CesiumOLImageryProvider } from './cesium-ol-imagery-provider';

const originalFactoryCreate = cesiumTileSourcesFactory.create;

cesiumTileSourcesFactory.create = (id: string, config: any) => {
    //use ol tile source for unsupported source types and unsupported projections
    if (!cesiumTileSourcesFactory.isRegistered(id) || (config.srs && getProjectionType(config.srs) === ProjectionType.Other)) {
        const olSource = olTileSourcesFactory.create(id, config);
        if (olSource) {
            return new CesiumOLImageryProvider(olSource, config);
        }
    } else {
        return originalFactoryCreate(id, config);
    }
};

export * from './cesium-ol-imagery-provider';
