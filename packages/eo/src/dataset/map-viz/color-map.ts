import { types, Instance, SnapshotIn } from 'mobx-state-tree';

export enum ColormapConfigMode {
    None = 'None',
    Presets = 'Presets',
    Customizable = 'Customizable'
}

export type DataDomain = {
    min: number;
    max: number;
    noDataValue?: number;
};

export type DataVar = {
    id: string;
    name: string;
    domain: DataDomain;
    units?: string;
    description?: string;
};

export type ColorMapConfigPreset = {
    id: string;
    name: string;
    legend: React.ReactNode;
};

export type ColorMapConfig = {
    mode: ColormapConfigMode;
    colorMaps?: Array<ColorMapConfigPreset>
    variables?: DataVar | DataVar[];
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

const ColorMapCustomDecl = types.compose(
    'ColorMapCustom',
    ColorMapBase,
    types.model({
        mode: types.literal('custom'),
        domain: types.frozen<DataDomain>(),
        clamp: types.optional(types.boolean, true),
        noDataValue: types.maybe(types.number)
    }).actions(self => ({
        setDomain: (domain: DataDomain) => {
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

const ColorMapDecl = types.union(ColorMapPreset, ColorMapCustom);
type ColorMapType = typeof ColorMapDecl;
export interface ColorMapInterface extends ColorMapType {}
export const ColorMap: ColorMapInterface = ColorMapDecl;
export type IColorMap = Instance<ColorMapInterface>;
