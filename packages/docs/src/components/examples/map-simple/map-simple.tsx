import React from 'react';
import { Map, TileLayer, MapLayer } from '@oidajs/state-mobx';

import { MapComponent } from '@oidajs/ui-react-mobx';
import '@oidajs/map-ol';


const mapState = new Map({
    renderer: {
        id: 'ol',
        options: {}
    },
    view: {
        projection: {
            code: 'EPSG:4326'
        },
        viewport: {
            center: [12, 42],
            resolution: 3000
        },
        config: {
            animateOnChange: true
        }
    }
});

mapState.layers.children.add([
    new TileLayer({
        id: 'base',
        source: {
            id: 'osm'
        },
        hovered: true
    }),
    MapLayer.create({
        id: 'test',
        opacity: 0.5,
        layerType: 'tile',
        source: {
            id: 'bing',
            imagerySet: 'Aerial',
            key: 'AmEV-s101vB0DGqgW8Y9rjCWBg3ZinPm_y-QM6RXHmds_mSiZDbYxeEFcugx10rr'
        }
    })
]);


const MapMobx = () => {
    return (<MapComponent style={{height: '300px', width: '400px', position: 'relative'}} mapState={mapState}/>);
};

export default MapMobx;
