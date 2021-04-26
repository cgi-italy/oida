import {
    RasterBandModeConfig, RasterBandModeType, RasterBandConfig,
    RasterBandModeSingleProps, RasterBandModePresetProps, RasterBandPreset, RasterBandModeCombinationProps,
    RasterBandModeChoice, RasterBandModeCombinationConfig, BandScalingMode
} from '../models/raster-band-mode';
import { isValueDomain } from '../types';

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
        if (domain && isValueDomain(domain)) {
            if (!range && domain.min !== undefined && domain.max !== undefined) {
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
    config?: RasterBandModeCombinationConfig;
    bands: RasterBandConfig[];
};


export const getRasterBandCombinationConfig = (options: getRasterBandCombinationConfigOptions): Promise<RasterBandModeCombinationProps> => {
    if (options.default) {
        return Promise.resolve({
            type: RasterBandModeType.Combination,
            config: options.config,
            ...options.default
        });
    } else {
        const bands = options.bands;

        const rgb = [bands[0], bands[Math.min(1, bands.length - 1)], bands[Math.min(2, bands.length - 1)]];

        const bandScalingMode = options.config?.supportBandScalingMode || BandScalingMode.None;

        return Promise.all(rgb.map((band) => {
            return getDatasetVariableDomain(band).then((domain) => {
                if (domain && isValueDomain(domain) && domain.min !== undefined && domain.max !== undefined) {
                    return {
                        min: domain.min,
                        max: domain.max
                    };
                } else {
                    return undefined;
                }
            });
        })).then((domains) => {
            return {
                type: RasterBandModeType.Combination,
                red: rgb[0].id,
                green: rgb[1].id,
                blue: rgb[2].id,
                dataRange: domains[0] || domains[1] || domains[2],
                redRange: domains[0],
                greenRange: domains[1],
                blueRange: domains[2],
                bandScalingMode: bandScalingMode !== BandScalingMode.None ? BandScalingMode.Global : BandScalingMode.None,
                config: options.config
            };
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
            default: modeConfig.default,
            config: modeConfig.config
        });
    } else {
        throw new Error('getRasterBandModeConfig: unknown RasteBandModeType');
    }
};
