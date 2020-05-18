import React, { useContext, useEffect, useState } from 'react';

import {
    Route,
    NavLink
} from 'react-router-dom';

import {
    MapComponentFromModule as MapComponent, BreadcrumbItem, createAppStoreContext, destroyAppStoreContext
} from '@oida/ui-react-mst';

import { appState } from './store';

import { SideSection, SpotSection, MouseCoords, Breadcrumb, Settings } from './components';


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
        <React.Fragment>
            <NavLink to={'/appModules/spots'}>Spots</NavLink>
            <Breadcrumb/>
            <SideSection/>
            <Settings/>
            <MapComponent/>
            <MouseCoords/>
            <BreadcrumbItem
                data={{
                    key: 'home',
                    title: 'Home',
                    link: '/appModules'
                }}
            />
            <Route path='/appModules/spots' component={() => (<SpotSection/>)}></Route>
        </React.Fragment>
    );
};

export const sample =  {
    title: 'App modules example',
    component: AppModulesSample,
};
