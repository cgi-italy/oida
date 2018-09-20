import * as React from 'react';
import { Map, TileLayer, MapRendererController } from '@cgi-eo/map-mobx';
import '@cgi-eo/map-ol';

import { MapComponent } from '@cgi-eo/map-react-mobx';

let mapState = Map.create({
    renderer: {
        id: 'ol'
    },
    view: {
        projection: {
            code: 'EPSG:4326'
        },
        viewport: {
            center: [12, 42],
            resolution: 3000
        }
    }
});

mapState.layers.children.add(TileLayer.create({
    id: 'base',
    layerType: 'tile',
    source: {
        id: 'osm'
    }
}));

window['gMapState'] = mapState;

let mapRendererController = new MapRendererController({
    state: mapState
});


export const MapWidget = (props) => {
    return (
        <MapComponent rendererController={mapRendererController} />
    );
};
