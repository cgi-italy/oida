import { RasterBandModeConfig, RasterBandModeType, RasterBandConfig,
    RasterBandModeSingleProps, RasterBandModePresetProps, RasterBandPreset, RasterBandModeCombinationProps, RasterBandModeChoice
} from '../models/raster-band-mode';

import { getDatasetVariableDomain } from './get-dataset-variable-domain';

type getRasterBandSingleConfigOptions = {
    default?: Omit<RasterBandModeSingleProps, 'type' | 'colorMap'>;
    bands: RasterBandConfig[];
};

export const getRasterBandSingleConfig = (options: getRasterBandSingleConfigOptions): Promise<RasterBandModeSingleProps> => {

    let defaultBand: RasterBandConfig | undefined;
    if (options.default?.band) {
        defaultBand = options.bands.find(band => band.id === options.default?.band);
    }
    if (!defaultBand) {
        defaultBand = options.bands[0];
    }
    const colorScales = defaultBand.colorScales!;

    let colorScale = defaultBand.default?.colorScale || colorScales[0].id;
    let range = defaultBand.default?.range;
    let clamp = true;
    if (defaultBand.default?.clamp !== undefined) {
        clamp = defaultBand.default.clamp;
    }
    let noDataValue: number | undefined = undefined;

    return getDatasetVariableDomain(defaultBand).then((domain) => {
        if (domain) {
            if (!range) {
                range = {
                    min: domain.min,
                    max: domain.max
                };
            }
            noDataValue = domain.noData;
        }

        return {
            type: RasterBandModeType.Single,
            band: defaultBand!.id,
            colorMap: {
                colorScale: colorScale,
                domain: range ? {
                    mapRange: range,
                    clamp: clamp,
                    noDataValue: noDataValue
                } : undefined
            }
        };
    });
};

type getRasterBandPresetConfigOptions = {
    default?: Omit<RasterBandModePresetProps, 'type'>;
    presets: RasterBandPreset[];
};


export const getRasterBandPresetConfig = (options: getRasterBandPresetConfigOptions): Promise<RasterBandModePresetProps>  => {
    if (options.default) {
        return Promise.resolve({
            type: RasterBandModeType.Preset,
            ...options.default
        });
    } else {
        const defaultPreset = options.presets[0];
        return Promise.resolve({
            type: RasterBandModeType.Preset,
            preset: defaultPreset.id
        });
    }
};

type getRasterBandCombinationConfigOptions = {
    default?: Omit<RasterBandModeCombinationProps, 'type'>;
    bands: RasterBandConfig[];
};


export const getRasterBandCombinationConfig = (options: getRasterBandCombinationConfigOptions): Promise<RasterBandModeCombinationProps> => {
    if (options.default) {
        return Promise.resolve({
            type: RasterBandModeType.Combination,
            ...options.default
        });
    } else {
        const bands = options.bands;
        return Promise.resolve({
            type: RasterBandModeType.Combination,
            red: bands[0].id,
            green: bands[1].id,
            blue: bands[2].id
        });
    }
};


export type getRasterBandModeConfigOptions = {
    config: RasterBandModeConfig;
    mode?: RasterBandModeType;
};

export const getRasterBandModeFromConfig = (options: getRasterBandModeConfigOptions):
    Promise<RasterBandModeSingleProps | RasterBandModePresetProps | RasterBandModeCombinationProps> => {

    let modeConfig: RasterBandModeChoice | undefined;
    if (options.mode) {
        modeConfig = options.config.supportedModes.find(mode => mode.type === options.mode);
    }
    if (!modeConfig) {
        modeConfig = options.config.supportedModes[options.config.defaultMode || 0];
    }

    if (modeConfig.type === RasterBandModeType.Single) {
        if (!options.config.bands) {
            throw new Error('getRasterBandModeConfig: bands must be defined for RasterBandModeType.Single');
        }
        return getRasterBandSingleConfig({
            bands: options.config.bands,
            default: modeConfig.default
        });
    } else if (modeConfig.type === RasterBandModeType.Preset) {
        if (!options.config.presets) {
            throw new Error('getRasterBandModeConfig: presets must be defined for RasterBandModeType.Preset');
        }
        return getRasterBandPresetConfig({
            presets: options.config.presets,
            default: modeConfig.default
        });
    } else if (modeConfig.type === RasterBandModeType.Combination) {
        if (!options.config.bands) {
            throw new Error('getRasterBandModeConfig: bands must be defined for RasterBandModeType.Combination');
        }
        return getRasterBandCombinationConfig({
            bands: options.config.bands,
            default: modeConfig.default
        });
    } else {
        throw new Error('getRasterBandModeConfig: unknown RasteBandModeType');
    }
};
