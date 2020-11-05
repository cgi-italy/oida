import React from 'react';
import Loadable from 'react-loadable';

import { MapComponent as OriginalMapComponent, MapComponentFromModule as OriginalMapComponentFromModule } from '@oida/ui-react-mobx';

export const MapComponent = Loadable.Map({
    loader: {
        ol: () => import('@oida/map-ol'),
        cesium: () => import('@oida/map-cesium')
    },
    loading() {
      return <div>Loading map...</div>;
    },
    render(loaded, props) {
        return <OriginalMapComponent {...props}/>;
    }
});

export const MapComponentFromModule = Loadable.Map({
    loader: {
        ol: () => import('@oida/map-ol'),
        cesium: () => import('@oida/map-cesium')
    },
    loading() {
      return <div>Loading map...</div>;
    },
    render(loaded, props) {
        return <OriginalMapComponentFromModule {...props}/>;
    }
});
