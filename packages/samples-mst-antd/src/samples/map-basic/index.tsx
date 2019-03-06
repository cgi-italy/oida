import React from 'react';
import { Provider } from 'mobx-react';
import { Button } from 'antd';

import { ChoiceSelectorCombo } from '@oida/ui-react-antd/src/general/choice-selector-combo';
import { inject, MapComponent, MapProjSelector, MapRendererSelector } from '@oida/ui-react-mst';

import { getAppState } from './store';

let appState = getAppState();
window['gAppState'] = appState;

const MapWrapperBase = ({mapState}) => {
    return (
        <React.Fragment>
            <MapProjSelector
                projections={[{code: 'EPSG:4326', name: 'Geographic'}, {code: 'EPSG:900913', name: 'Mercator'}]}
                mapView={mapState.view}
                render={(props) => (<ChoiceSelectorCombo {...props}></ChoiceSelectorCombo>)}
            ></MapProjSelector>
            <MapRendererSelector
                renderers={[{id: 'ol', name: 'OL'}, {id: 'cesium', name: 'Cesium'}]}
                mapState={mapState}
                render={(props) => (<ChoiceSelectorCombo {...props}></ChoiceSelectorCombo>)}
            ></MapRendererSelector>
            <MapComponent mapState={mapState}></MapComponent>
        </React.Fragment>
    );
};

const MapWrapper = inject(({appState}) => {
    return {
        mapState: appState
    };
})(MapWrapperBase);


const BasicSample = () => (
    <Provider appState={appState}>
        <React.Fragment>
            <Button type='primary'>Test</Button>
            <MapWrapper></MapWrapper>
        </React.Fragment>
    </Provider>
);

export const sample =  {
    title: 'Basic map example',
    component: BasicSample,
};
