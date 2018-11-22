import { types } from 'mobx-state-tree';

import { MapEntityType, createMapEntityCollectionType, FeatureLayer } from '@oida/state-mst';

import { mapState } from './map';
const boltIcon = require('../../../images/bolt.png');


export const FeatureType = MapEntityType.addType('feature', types.model('Feature', {
    geometry: types.frozen()
}));

export const FeatureCollection = createMapEntityCollectionType(FeatureType);

export const myFeatures = FeatureCollection.create({
    collectionId: 'myFeatures'
});


let featureLayer = FeatureLayer.create({
    id: 'featureSample',
    source: myFeatures,
    config: {
        clampToGround: true
    },
    geometryGetter: (entity) => {
        return entity.geometry;
    },
    styleGetter: (entity) => {
        return {
            point: {
                visible: entity.visible,
                url: boltIcon,
                color: entity.hovered ? [1, 1, 0] : [1, 1, 1],
                scale: 0.3,
                radius: 10,
                fillColor: [1, 0, 0]
            },
            line: {
                visible: entity.visible,
                color: entity.hovered ? [1, 1, 0] : [0, 1, 0],
                width: entity.hovered ? 4 : 2
            },
            polygon: {
                visible: entity.visible,
                fillColor: entity.hovered ? [1, 1, 0, 0.7] : [0, 0, 1, 0.5],
                strokeColor: entity.hovered ? [1, 1, 0, 0.7] : [0, 0, 1],
                strokeWidth: entity.hovered ? 5 : 3
            }
        };
    }
});

mapState.layers.children.add(featureLayer);
