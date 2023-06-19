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

import '@oidajs/map-ol';

type MyFeatureProps = {
    geometry: Geometry;
} & Omit<EntityProps, 'entityType'>;

class MyFeature extends Entity {
    geometry: GeometryState;

    constructor(props: MyFeatureProps) {
        super({
            ...props,
            entityType: 'MyFeature'
        });
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
                    point: {
                        visible: feature.visible.value,
                        radius: feature.hovered.value ? 7 : 5,
                        fillColor: feature.selected.value ? [1, 1, 0] : [0, 0, 1],
                        zIndex: feature.hovered.value ? 1 : 0,
                        strokeColor: [0, 0, 0]
                    }
                };
            },
            clustering: {
                enabled: true,
                style: (features) => {
                    const allSelected = features.every((feature) => feature.model.selected.value);
                    const someSelected = !allSelected && features.some((feature) => feature.model.selected.value);
                    return {
                        label: {
                            text: `${features.length}`,
                            visible: true,
                            fillColor: [1, 1, 1]
                        },
                        point: {
                            radius: 5 + 3 * `${features.length}`.length,
                            visible: true,
                            fillColor: allSelected ? [1, 1, 0] : someSelected ? [1, 0.5, 0] : [0, 0, 1],
                            strokeColor: [1, 1, 1]
                        }
                    };
                }
            }
        }
    })
);

const features: MyFeature[] = [];

const generateRandomLocation = (props: { minLon: number; maxLon: number; minLat: number; maxLat: number }) => {
    return [props.minLon + Math.random() * (props.maxLon - props.minLon), props.minLat + Math.random() * (props.maxLat - props.minLat)];
};

for (let i = 0; i < 50000; ++i) {
    features.push(
        new MyFeature({
            id: `feat_${i}`,
            geometry: {
                type: 'Point',
                coordinates: generateRandomLocation({
                    minLon: 10,
                    maxLon: 12,
                    minLat: 41,
                    maxLat: 43
                })
            }
        })
    );
}

appState.features.add(features);

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
