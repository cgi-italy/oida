import { types, Instance, SnapshotIn } from 'mobx-state-tree';
import { DatasetVariable, ValueDomain } from '../dataset-variable';
import { ColorMap, ColormapConfigMode, ColorMapConfigPreset } from './color-map';

export enum BandMathConfigMode {
    Single = 'single',
    Presets = 'preset',
    Combination = 'combination',
    Formula = 'formula'
}

export type BandMathConfigPreset = {
    id: string;
    name: string;
    preview: string;
    description?: string;
};

export type DatasetBand = DatasetVariable<ValueDomain<number>> & {
    color: string
};

export type DatasetBandGroup = {
    id: string;
    name: string;
    description?: string;
    units?: string;
    bands: DatasetBand[];
};

export type BandMathConfig = {
    supportedModes: BandMathConfigMode[];
    presets?: BandMathConfigPreset[];
    bandGroups?: DatasetBandGroup[];
    singleBandMode?: ColormapConfigMode;
    singleBandColorMaps?: ColorMapConfigPreset[];
    default?: SnapshotIn<typeof BandMath>
};

export const getFlattenDatasetBands = (bandGroups: DatasetBandGroup[]) => {
    let bands = bandGroups.map((group) => {
        return group.bands.map((band) => {
            return {
                ...band,
                units: band.units || group.units,
            };
        });
    });

    return ([] as DatasetBand[]).concat(...bands);

};
const BandMathSingleDecl = types.model('BandMathSingle', {
    mode: types.literal('single'),
    colorMap: ColorMap
});
type BandMathSingleType = typeof BandMathSingleDecl;
export interface BandMathSingleInterface extends BandMathSingleType {}
export const BandMathSingle: BandMathSingleInterface = BandMathSingleDecl;
export type IBandMathSingle = Instance<BandMathSingleInterface>;

const BandMathPresetDecl = types.model('BandMathPreset', {
    mode: types.literal('preset'),
    preset: types.string
}).actions((self) => {
    return {
        setPreset: (preset: string) => {
            self.preset = preset;
        }
    };
});

type BandMathPresetType = typeof BandMathPresetDecl;
export interface BandMathPresetInterface extends BandMathPresetType {}
export const BandMathPreset: BandMathPresetInterface = BandMathPresetDecl;
export type IBandMathPreset = Instance<BandMathPresetInterface>;

export const BandMathCombinationDecl = types.model('BandMathCombination', {
    mode: types.literal('combination'),
    red: types.string,
    green: types.string,
    blue: types.string,
    gain: types.optional(types.number, 1)
}).actions((self) => {
    return {
        setRed: (band: string) => {
            self.red = band;
        },
        setGreen: (band: string) => {
            self.green = band;
        },
        setBlue: (band: string) => {
            self.blue = band;
        },
        setGain: (gain: number) => {
            self.gain = gain;
        }
    };
});

type BandMathCombinationType = typeof BandMathCombinationDecl;
export interface BandMathCombinationInterface extends BandMathCombinationType {}
export const BandMathCombination: BandMathCombinationInterface = BandMathCombinationDecl;
export type IBandMathCombination = Instance<BandMathCombinationInterface>;

const BandMathFormulaDecl = types.model('BandMathFormula', {
    mode: types.literal('formula'),
    formula: types.string
});

type BandMathFormulaType = typeof BandMathFormulaDecl;
export interface BandMathFormulaInterface extends BandMathFormulaType {}
export const BandMathFormula: BandMathFormulaInterface = BandMathFormulaDecl;
export type IBandMathFormula = Instance<BandMathFormulaInterface>;

const BandMathDecl = types.union(BandMathSingle, BandMathPreset, BandMathCombination, BandMathFormula);
type BandMathType = typeof BandMathDecl;
export interface BandMathInterface extends BandMathType {}
export const BandMath: BandMathInterface = BandMathDecl;
export type IBandMath = Instance<BandMathInterface>;
