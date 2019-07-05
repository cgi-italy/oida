import React, { useContext, useMemo } from 'react';

import {
    Route,
    NavLink
} from 'react-router-dom';

import {
    MapComponentFromModule as MapComponent, BreadcrumbItem
} from '@oida/ui-react-mst';

import { AppContext } from './store';
import { SideSection, SpotSection, MouseCoords, Breadcrumb, Settings } from './components';


const AppModulesSample = () => {

    const appState = useContext(AppContext);

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
