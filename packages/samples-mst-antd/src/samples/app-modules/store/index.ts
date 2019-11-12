import React from 'react';

import { types } from 'mobx-state-tree';
import { getFormatters } from './get-formatters';
import '@oida/map-ol';
import '@oida/map-cesium';

import { withAppModules,
    DefaultMapModule, DefaultAoiModule, DefaultFormattersModule, DefaultBreadcrumbModule, DefaultDynamicSectionsModule,
    createAppStoreContext } from '@oida/ui-react-mst';


export const AppStateModel = types.compose(
    types.model('AppState', {
    }),
    withAppModules
);

let appState = AppStateModel.create({
    modules: {}
});

let mapProjections = [
    {name: 'Geographic', code: 'EPSG:4326'},
    {name: 'Mercator', code: 'EPSG:900913'}
];

let baseLayers = [{
    id: 'osm',
    name: 'OSM',
    config: {
        id: 'osm'
    }
}, {
    id: 'bing',
    name: 'Bing',
    config: {
      id: 'bing',
      imagerySet: 'Aerial',
      key: 'AmEV-s101vB0DGqgW8Y9rjCWBg3ZinPm_y-QM6RXHmds_mSiZDbYxeEFcugx10rr',
      maxZoom: 19
    }
}];

let renderers = [{
    id: 'ol',
    name: 'OL'
}, {
    id: 'cesium',
    name: 'Cesium'
}];

let formattersModule = appState.addModule(DefaultFormattersModule, getFormatters());

appState.addModule(DefaultMapModule, {projections: mapProjections, baseLayers, renderers, initialOptions: {
    baseLayer: 'osm',
    renderer: 'ol',
    projection: 'EPSG:900913'
}}, {
    formattersModule: formattersModule.id
});

appState.addModule(DefaultAoiModule, {});

appState.addModule(DefaultBreadcrumbModule, {pageTitle: 'App modules sample'});

appState.addModule(DefaultDynamicSectionsModule, {});

export const AppContext = createAppStoreContext(appState);

