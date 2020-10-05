import React from 'react';
import Loadable from 'react-loadable';

import { MapComponent as OriginalMapComponent } from '@oida/ui-react-mst';

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
