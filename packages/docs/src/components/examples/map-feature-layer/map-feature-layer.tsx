import React from 'react';

import { Geometry } from '@oidajs/core';
import {
    Map,
    FeatureLayer,
    TileLayer,
    IndexedCollection,
    Entity,
    GeometryState,
    EntityProps,
    FeatureHoverInteraction,
    FeatureSelectInteraction,
    MouseCoordsInteraction
} from '@oidajs/state-mobx';

import { useMapMouseCoords } from '@oidajs/ui-react-mobx';

import { MapComponent } from '@oidajs/ui-react-mobx';

import '@oidajs/map-cesium';

type MyFeatureProps = {
    geometry: Geometry;
} & EntityProps;

class MyFeature extends Entity {
    geometry: GeometryState;

    constructor(props: MyFeatureProps) {
        super(props);
        this.geometry = new GeometryState(props);
    }
}

type AppStateProps = {
    map: Map;
};

class AppState {
    readonly map: Map;
    features: IndexedCollection<MyFeature>;

    constructor(props: AppStateProps) {
        this.map = props.map;
        this.features = new IndexedCollection({
            idGetter: (feature) => feature.id
        });
    }
}

const mouseCoordsInteraction = new MouseCoordsInteraction({
    id: 'mouseCoords'
});

const appState = new AppState({
    map: new Map({
        renderer: {
            id: 'cesium',
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
        },
        layers: {
            id: 'rootLayers',
            children: [
                new TileLayer({
                    id: 'base',
                    source: {
                        id: 'osm'
                    }
                })
            ]
        },
        interactions: [
            mouseCoordsInteraction,
            new FeatureHoverInteraction({
                id: 'featureHoverInteraction'
            }),
            new FeatureSelectInteraction({
                id: 'featureSelect',
                config: {
                    multiple: true
                }
            })
        ]
    })
});

appState.map.layers.children.add(
    new FeatureLayer({
        id: 'featureLayer',
        source: appState.features.items,
        config: {
            geometryGetter: (feature) => feature.geometry.value,
            styleGetter: (feature) => {
                return {
                    polygon: {
                        visible: feature.visible.value,
                        strokeColor: feature.selected.value ? [1, 1, 0] : [0, 0, 1],
                        fillColor: feature.hovered.value ? [0, 0, 1, 0.5] : [0, 0, 1, 0.2]
                    }
                };
            }
        }
    })
);

appState.features.add([
    new MyFeature({
        id: 'testFeature',
        entityType: 'myFeature',
        geometry: {
            type: 'BBox',
            bbox: [10, 40, 12, 41]
        }
    }),
    new MyFeature({
        id: 'testFeature2',
        entityType: 'myFeature',
        geometry: {
            type: 'BBox',
            bbox: [11, 44, 13, 45]
        }
    })
]);

const MouseCoords = () => {
    const mouseCoords = useMapMouseCoords({
        mouseCoordsInteraction: mouseCoordsInteraction
    });

    if (!mouseCoords?.coords) {
        return null;
    }

    return (
        <div>
            {mouseCoords.coords.lat} {mouseCoords.coords.lon}
        </div>
    );
};

const MapFeatureLayer = () => {
    return (
        <React.Fragment>
            <MapComponent style={{ height: '300px', width: '400px', position: 'relative' }} mapState={appState.map} />
            <MouseCoords />
        </React.Fragment>
    );
};

export default MapFeatureLayer;
