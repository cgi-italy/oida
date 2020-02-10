import { types, Instance } from 'mobx-state-tree';

import chroma from 'chroma-js';

import { IFeatureStyle } from '@oida/core';
import { Entity, hasGeometry, hasStyleAsGetter, createEntityCollectionType } from '@oida/state-mst';

let aoiStyleGetter = (aoiInstance): IFeatureStyle => {

    let color = chroma(aoiInstance.color);
    if (aoiInstance.selected) {
        color = color.alpha(0.3);
    } else {
        color = color.alpha(0.1);
    }

    return {
        point: {
            visible: aoiInstance.visible,
            radius: 5,
            fillColor: color.gl(),
            strokeColor: color.alpha(1).gl()
        },
        line: {
            visible: aoiInstance.visible,
            color: color.alpha(1).gl(),
            width: aoiInstance.hovered ? 3 : 2
        },
        polygon: {
            visible: aoiInstance.visible,
            fillColor: color.gl(),
            strokeColor: color.alpha(1).gl(),
            strokeWidth: aoiInstance.hovered ? 3 : 2
        }
    };
};

let colorPalette = [
    '#78d747',
    '#0153e4',
    '#7bd68e',
    '#7436b9',
    '#648b37',
    '#d154ca',
    '#805b33',
    '#857cce',
    '#d58d3f',
    '#6e99bd',
    '#d14a40',
    '#81cec3',
    '#76303b',
    '#cdc094',
    '#37323d',
    '#ca4a86',
    '#446447',
    '#502d6d',
    '#cfd04b',
    '#cc97af'
];

let nextColorIdx = 0;
let getAoiColor = () => {
    let color = colorPalette[nextColorIdx];
    nextColorIdx = (nextColorIdx + 1) % colorPalette.length;
    return color;
};

const AOIDecl = Entity.addModel(types.compose('AOI',
        types.model({
            name: types.string,
            defaultColor: types.optional(types.string, getAoiColor),
            properties: types.maybe(types.frozen<GeoJSON.GeoJsonProperties>())
        }),
        hasGeometry,
        hasStyleAsGetter(aoiStyleGetter)
    ).views((self: any) => {
        return {
            get color() {
                let color = self.defaultColor;
                if ( self.selected) {
                    color = '#FFFF00';
                } else if (self.hovered) {
                    color = chroma(color).brighten(1).hex();
                }
                return color;
            }
        };
    }).actions((self) => {
        return {
            setName: (name: string) => {
                self.name = name;
            }
        };
    })
);


type AOIType = typeof AOIDecl;
export interface AOIInterface extends AOIType {}
export const AOI: AOIInterface = AOIDecl;
export interface IAOI extends Instance<AOIInterface> {}

const AOICollectionDecl = createEntityCollectionType(AOI);
type AOICollectionType = typeof AOICollectionDecl;
export interface AOICollectionInterface extends AOICollectionType {}
export const AOICollection: AOICollectionInterface = AOICollectionDecl;
export interface IAOICollection extends Instance<AOICollectionInterface> {}
