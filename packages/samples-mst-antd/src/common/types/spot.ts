import { types, Instance } from 'mobx-state-tree';

import { IFeatureStyle } from '@oida/core';

import { Entity, createEntityCollectionType, hasGeometryAsGetter, hasStyleAsGetter, enumFromType } from '@oida/state-mst';

import foodSpotIcon from '../../../assets/icons/food.png';
import musicSpotIcon from '../../../assets/icons/music.png';
import drinkSpotIcon from '../../../assets/icons/drink.png';

export enum SpotType {
    Music = 'MUSIC',
    Drink = 'DRINK',
    Food = 'FOOD'
}

const getSpotGeometry = (spot) => (
    {
        type: 'Point',
        coordinates: [spot.location.lon, spot.location.lat]
    }
);

const spotIcons = {
    MUSIC: {
        url: musicSpotIcon,
        scale: 0.5,
        color: [1.0, 0.5, 0.0, 1.0]
    },
    DRINK: {
        url: drinkSpotIcon,
        scale: 0.5,
        color:  [1.0, 0.0, 0.0, 1.0]
    },
    FOOD: {
        url: foodSpotIcon,
        scale: 0.5,
        color: [1.0, 0.7, 0.0, 1.0]
    }
};

const getSpotStyle = (spot) => {
    let icon = spotIcons[spot.type];

    return {
        point: {
            url: icon.url,
            visible: spot.visible,
            color: spot.selected ? [1.0, 1.0, 0.0] : icon.color,
            size: spot.hovered ? icon.scale * 1.1 : icon.scale
        }
    } as IFeatureStyle;
};


export type SpotLocation = {
    lat: number;
    lon: number;
};


export const Spot = Entity.addModel(
    types.compose(
        'Spot',
        types.model({
            name: types.string,
            type: enumFromType<SpotType>(SpotType),
            location: types.frozen<SpotLocation>()
        }),
        hasGeometryAsGetter(getSpotGeometry),
        hasStyleAsGetter(getSpotStyle)
    )
);

export const SpotCollection = createEntityCollectionType(Spot);

export type ISpot = Instance<typeof Spot>;
export type ISpotCollection = Instance<typeof SpotCollection>;
