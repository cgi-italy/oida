import React from 'react';
import { Map, TileLayer } from '@oida/state-mst';

// import { MapComponent } from '@oida/ui-react-mst';
import { MapComponent } from '../../common/async-map';


const mapState = Map.create({
    renderer: {
        id: 'ol'
    },
    view: {
        projection: {
            code: 'EPSG:4326'
        },
        viewport: {
            center: [12, 42],
            resolution: 3000
        }
    }
});

mapState.layers.children.add([
    TileLayer.create({
        id: 'base',
        layerType: 'tile',
        source: {
            id: 'osm'
        },
    })
]);

export const SimpleMap = () => {
    return (<MapComponent style={{height: '300px', width: '400px', position: 'relative'}} mapState={mapState}/>);
};

