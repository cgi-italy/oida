import { types, Instance, SnapshotIn } from 'mobx-state-tree';

import { DatasetVariable, DomainRange } from '../dataset-variable';

export enum ColormapConfigMode {
    None = 'None',
    Presets = 'Presets',
    Customizable = 'Customizable'
}

export type ColorMapConfigPreset = {
    id: string;
    name: string;
    legend: HTMLImageElement | HTMLCanvasElement;
};

export type ColorMapConfig = {
    mode: ColormapConfigMode;
    colorMaps: Array<ColorMapConfigPreset>
    variables?: DatasetVariable<number> | DatasetVariable<number>[];
    default?: SnapshotIn<typeof ColorMap>
};

const ColorMapBase = types.model({
    preset: types.string,
    variable: types.maybe(types.string)
}).actions(self => ({
    setPreset: (preset: string) => {
        self.preset = preset;
    },
    setVariable: (variable: string | undefined) => {
        self.variable = variable;
    }
}));

type ColorMapBaseType = typeof ColorMapBase;
export interface ColorMapBaseInterface extends ColorMapBaseType {}
export type IColorMapBase = Instance<ColorMapBaseInterface>;


const ColorMapPresetDecl = types.compose(
    'ColorMapPreset',
    ColorMapBase,
    types.model({
        mode: types.literal('preset')
    })
);

type ColorMapPresetType = typeof ColorMapPresetDecl;
export interface ColorMapPresetInterface extends ColorMapPresetType {}
export const ColorMapPreset: ColorMapPresetInterface = ColorMapPresetDecl;
export type IColorMapPreset = Instance<ColorMapPresetInterface>;

const ColorMapCustomDecl = types.compose(
    'ColorMapCustom',
    ColorMapBase,
    types.model({
        mode: types.literal('custom'),
        domain: types.frozen<DomainRange<number>>(),
        clamp: types.optional(types.boolean, true),
        noDataValue: types.maybe(types.number)
    }).actions(self => ({
        setDomain: (domain: DomainRange<number>) => {
            self.domain = domain;
        },
        setClamp: (clamp: boolean) => {
            self.clamp = clamp;
        },
        setNoDataValue: (noDataValue: number | undefined) => {
            self.noDataValue = noDataValue;
        }
    }))
);

type ColorMapCustomType = typeof ColorMapCustomDecl;
export interface ColorMapCustomInterface extends ColorMapCustomType {}
export const ColorMapCustom: ColorMapCustomInterface = ColorMapCustomDecl;
export type IColorMapCustom = Instance<ColorMapCustomInterface>;

const ColorMapDecl = types.union(ColorMapPreset, ColorMapCustom);
type ColorMapType = typeof ColorMapDecl;
export interface ColorMapInterface extends ColorMapType {}
export const ColorMap: ColorMapInterface = ColorMapDecl;
export type IColorMap = Instance<ColorMapInterface>;
