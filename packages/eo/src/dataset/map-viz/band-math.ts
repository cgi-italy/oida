import { types, Instance, SnapshotIn } from 'mobx-state-tree';

export enum BandMathConfigMode {
    None = 'None',
    Presets = 'Presets',
    Combination = 'Combination',
    Formula = 'Formula'
}

export type BandMathConfigPreset = {
    id: string;
    name: string;
    preview: string;
    description?: string;
};

export type BandMathConfig = {
    mode: BandMathConfigMode;
    presets?: Array<BandMathConfigPreset>;
    bands?: Array<{
        id: string;
        name: string;
        color: string;
    }>;
    default?: SnapshotIn<typeof BandMath>
};


const BandMathPresetDecl = types.model('BandMathPreset', {
    mode: types.literal('preset'),
    preset: types.string
});

type BandMathPresetType = typeof BandMathPresetDecl;
export interface BandMathPresetInterface extends BandMathPresetType {}
export const BandMathPreset: BandMathPresetInterface = BandMathPresetDecl;

export const BandMathCombinationDecl = types.model('BandMathCombination', {
    mode: types.literal('combination'),
    red: types.string,
    green: types.string,
    blue: types.string
});

type BandMathCombinationType = typeof BandMathCombinationDecl;
export interface BandMathCombinationInterface extends BandMathCombinationType {}
export const BandMathCombination: BandMathCombinationInterface = BandMathCombinationDecl;

const BandMathFormulaDecl = types.model('BandMathFormula', {
    mode: types.literal('formula'),
    formula: types.string
});

type BandMathFormulaType = typeof BandMathFormulaDecl;
export interface BandMathFormulaInterface extends BandMathFormulaType {}
export const BandMathFormula: BandMathFormulaInterface = BandMathFormulaDecl;

const BandMathDecl = types.union(BandMathPreset, BandMathCombination, BandMathFormula);
type BandMathType = typeof BandMathDecl;
export interface BandMathInterface extends BandMathType {}
export const BandMath: BandMathInterface = BandMathDecl;
export type IBandMath = Instance<BandMathInterface>;
