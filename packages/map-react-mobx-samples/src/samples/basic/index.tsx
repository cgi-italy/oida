import * as React from 'react';
import { Provider } from 'mobx-react';
import { MapWidget } from './map';

const BasicSample = () => (
    <Provider>
        <MapWidget></MapWidget>
    </Provider>
);

export const sample =  {
    title: 'Basic map example',
    component: BasicSample,
};
