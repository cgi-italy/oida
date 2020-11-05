import { NumericVariable, DomainRange } from '../types/dataset-variable';

import { ColorScale, ColorMap, ColorMapProps } from './color-map';
import { observable, action, makeObservable } from 'mobx';

export type RasterBandConfig = NumericVariable & {
    colorScales?: ColorScale[];
    default?: {
        range?: DomainRange<number>;
        colorScale?: string;
        clamp?: boolean;
    }
    color?: string;
};


export enum RasterBandModeType {
    Single = 'single',
    Preset = 'preset',
    Combination = 'combination',
    Formula = 'formula'
}

export type RasterBandPreset = {
    id: string;
    name: string;
    preview: string;
    description?: string;
};

export type RasterBandGroup = {
    id: string;
    name: string;
    description?: string;
    units?: string;
    bandIndices: number[];
};

export type RasterBandModeChoice = {
    type: RasterBandModeType.Single,
    default?: Omit<RasterBandModeSingleProps, 'type' |'colorMap'>
} | {
    type: RasterBandModeType.Preset,
    default?: Omit<RasterBandModePresetProps, 'type'>
} | {
    type: RasterBandModeType.Combination,
    default?: Omit<RasterBandModeCombinationProps, 'type'>
};

export type RasterBandModeConfig = {
    supportedModes: RasterBandModeChoice[];
    bands?: RasterBandConfig[];
    presets?: RasterBandPreset[];
    bandGroups?: RasterBandGroup[];
    defaultMode?: number;
};

export type RasterBandModeSingleProps = {
    type: RasterBandModeType.Single;
    band: string;
    colorMap: ColorMap | ColorMapProps;
};

export class RasterBandModeSingle {
    readonly type = RasterBandModeType.Single;
    @observable.ref band: string;
    @observable.ref colorMap: ColorMap;

    constructor(props: Omit<RasterBandModeSingleProps, 'type'>) {
        this.band = props.band;
        this.colorMap = props.colorMap instanceof ColorMap ? props.colorMap : new ColorMap(props.colorMap);

        makeObservable(this);
    }

    @action
    setBand(band: string) {
        this.band = band;
    }

    @action
    setColorMap(colorMap: ColorMap | ColorMapProps) {
        this.colorMap = colorMap instanceof ColorMap ? colorMap : new ColorMap(colorMap);
    }
}


export type RasterBandModePresetProps = {
    type: RasterBandModeType.Preset,
    preset: string;
};

export class RasterBandModePreset {
    readonly type = RasterBandModeType.Preset;
    @observable.ref preset: string;

    constructor(props: Omit<RasterBandModePresetProps, 'type'>) {
        this.preset = props.preset;

        makeObservable(this);
    }

    @action
    setPreset(preset: string) {
        this.preset = preset;
    }
}


export type RasterBandModeCombinationProps = {
    type: RasterBandModeType.Combination;
    red: string;
    green: string;
    blue: string;
};

export class RasterBandModeCombination {
    readonly type = RasterBandModeType.Combination;
    @observable.ref red: string;
    @observable.ref green: string;
    @observable.ref blue: string;

    constructor(props: Omit<RasterBandModeCombinationProps, 'type'>) {
        this.red = props.red;
        this.green = props.green;
        this.blue = props.blue;

        makeObservable(this);
    }

    @action
    setRed(red: string) {
        this.red = red;
    }

    @action
    setGreen(green: string) {
        this.green = green;
    }

    @action
    setBlue(blue: string) {
        this.blue = blue;
    }

}

export type RasterBandModeProps = {
    bandMode?: RasterBandModeSingleProps | RasterBandModePresetProps | RasterBandModeCombinationProps
};

export class RasterBandMode {
    @observable.ref value: RasterBandModeSingle | RasterBandModePreset | RasterBandModeCombination | undefined;

    constructor(props?: RasterBandModeProps) {
        this.setValue(props?.bandMode);
        makeObservable(this);
    }

    @action
    setValue(mode: RasterBandModeSingleProps | RasterBandModePresetProps | RasterBandModeCombinationProps | undefined) {
        if (!mode) {
            this.value = undefined;
        } else if (mode.type === RasterBandModeType.Single) {
            this.value = new RasterBandModeSingle(mode);
        } else if (mode.type === RasterBandModeType.Preset) {
            this.value = new RasterBandModePreset(mode);
        } else if (mode.type === RasterBandModeType.Combination) {
            this.value = new RasterBandModeCombination(mode);
        }
    }
}

//export type RasterBandMode = RasterBandModeSingle | RasterBandModePreset | RasterBandModeCombination;
