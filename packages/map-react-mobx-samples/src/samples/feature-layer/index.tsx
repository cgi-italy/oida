import * as React from 'react';
import { Provider } from 'mobx-react';

import { MapWidget, mapState } from './map';
import { myFeatures } from './feature';


const FeatureLayerSample = () => (
    <Provider>
        <MapWidget></MapWidget>
    </Provider>
);

myFeatures.add([
    {
        mapEntityType: 'feature',
        id: '1',
        geometry: {
            type: 'Point',
            coordinates: [12, 42]
        }
    }, {
        mapEntityType: 'feature',
        id: '2',
        geometry: {
            type: 'LineString',
            coordinates: [[10, 42], [11, 45], [10.4, 44]]
        }
    }, {
        mapEntityType: 'feature',
        id: '3',
        geometry: {
            type: 'Polygon',
            coordinates: [[[14, 45], [15, 45], [14.3, 44], [14, 45]]]
        }
    }, {
        mapEntityType: 'feature',
        id: '4',
        geometry: {
            type: 'MultiPolygon',
            coordinates: [
                [
                    [[9, 41], [9.4, 41.4], [9.6, 40.9], [9, 41]],
                    [[9.2, 41.1], [9.3, 41.2], [9.5, 41.1], [9.2, 41.1]]
                ],
                [
                    [[10, 41], [10.4, 41.4], [10.6, 40.9], [10, 41]]
                ]
            ]
        }
    }, {
        mapEntityType: 'feature',
        id: '5',
        geometry: {
            type: 'MultiLineString',
            coordinates: [
                [
                    [15, 40], [15.2, 40.5], [15.6, 40.6], [14, 40.1]
                ],
                [
                    [16, 40], [16.2, 40.5], [16.6, 40.6], [15, 40.1]
                ]
            ]
        }
    }
]);

document.addEventListener('keydown', ({key}) => {
    switch (key) {
        case 'o':
            mapState.setRenderer({id: 'ol'});
            break;
        case 'c':
            mapState.setRenderer({id: 'cesium'});
            break;
        case 'p':
            mapState.setRenderer({id: 'cesium', props: {sceneMode: 'columbus'}});
            break;
        default:
            break;
    }
});

export const sample = {
    title: 'Feature layer sample',
    component: FeatureLayerSample,
};
