import React, { useState, useEffect } from 'react';
import { createAppStoreContext, destroyAppStoreContext } from '@oidajs/ui-react-mobx';
import { MapComponentFromModule as MapComponent } from '@oidajs/ui-react-mobx';
import '@oidajs/map-cesium';
import '@oidajs/map-ol';

import { createAppStore } from './store';
import { Settings, MouseCoords } from './components';

import './app-modules.less';

const appState = createAppStore();

const AppModulesSample = () => {

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
        <div>
            <Settings/>
            <MapComponent style={{height: '300px', width: '400px', position: 'relative'}}/>
            <MouseCoords/>
        </div>
    );
};

export default AppModulesSample;
