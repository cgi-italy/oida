import React from 'react';

import { Map, TileLayer } from '@oida/state-mst';

import '@oida/map-ol';
import '@oida/map-cesium';

export const getAppState = () => {
    let appState = Map.create({
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

    appState.layers.children.add([
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

    return appState;
};

