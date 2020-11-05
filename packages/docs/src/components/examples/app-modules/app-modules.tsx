import React, { useState, useEffect } from 'react';
import { createAppStoreContext, destroyAppStoreContext } from '@oida/ui-react-mobx';
import { MapComponentFromModule as MapComponent } from '../../common/async-map-mobx';
import { createAppStore } from './store';
import { Settings, MouseCoords } from './components';

import './app-modules.less';

const appState = createAppStore();

export const AppModulesSample = () => {

    let [isContextReady, setContextReady] = useState(false);

    useEffect(() => {
        let appContext = createAppStoreContext(appState);
        setContextReady(true);
        return () => destroyAppStoreContext();
    }, []);

    if (!isContextReady) {
        return null;
    }

    return (
        <React.Fragment>
            <Settings/>
            <MapComponent style={{height: '300px', width: '400px', position: 'relative'}}/>
            <MouseCoords/>
        </React.Fragment>
    );
};
