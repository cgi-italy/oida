import { ImageryProvider } from 'cesium';

import { createDynamicFactory, IDynamicFactory, ITileSourceDefinitions } from '@oidajs/core';
import { extendImageryProvider, CesiumTileSource } from './cesium-tilesource-utils';

export const cesiumTileSourcesFactory = createDynamicFactory('cesium-tile-sources') as Omit<
    IDynamicFactory<ImageryProvider, ITileSourceDefinitions>,
    'create'
> & {
    create<R extends keyof ITileSourceDefinitions>(id: R, config: ITileSourceDefinitions[R]): CesiumTileSource | undefined;
};

const create = cesiumTileSourcesFactory.create as IDynamicFactory<ImageryProvider, ITileSourceDefinitions>['create'];
cesiumTileSourcesFactory.create = (id: string, config: any) => {
    const imageryProvider = create(id, config);
    if (imageryProvider) {
        return extendImageryProvider(imageryProvider);
    } else {
        return undefined;
    }
};
