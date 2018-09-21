import * as React from 'react';
import { Provider } from 'mobx-react';
import { MapWidget, mapState } from './map';

const BasicSample = () => (
    <Provider>
        <MapWidget></MapWidget>
    </Provider>
);

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

export const sample =  {
    title: 'Basic map example',
    component: BasicSample,
};
