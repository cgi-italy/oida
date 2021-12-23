import React, { lazy, Suspense } from 'react';

import { MapComponent, MapComponentProps } from '@oidajs/ui-react-mst';

export const LazyMapComponent = lazy(() => {
    const olPromise = import('@oidajs/map-ol');
    const cesiumPromise = import('@oidajs/map-cesium');

    return Promise.all([olPromise, cesiumPromise]).then(() => {
        return {
            default: MapComponent
        };
    });
});

export const LazyMap = (props: MapComponentProps) => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LazyMapComponent {...props} />
        </Suspense>
    );
};
