import * as React from 'react';

import { Map, TileLayer, MapRendererController } from '@oida/state-mst';

import '@oida/map-ol';
import '@oida/map-cesium';

import { MapComponent } from '@oida/map-react-mobx';

export const mapState = Map.create({
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

mapState.layers.children.add([
    TileLayer.create({
        id: 'base',
        layerType: 'tile',
        source: {
            id: 'osm'
        },
    }),
    {
        id: 's2',
        layerType: 'tile',
        source: {
            id: 'wms',
            url: 'https://tiles.maps.eox.at/wms',
            layers: 's2cloudless',
            parameters: {
                tiled: true
            },
            srs: 'EPSG:4326'
        },
        opacity: 0.5
    }
]);

window['gMapState'] = mapState;

let mapRendererController = new MapRendererController({
    state: mapState
});


export const MapWidget = (props) => {
    return (
        <MapComponent rendererController={mapRendererController} />
    );
};
