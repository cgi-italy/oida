import { autorun } from 'mobx';
import { types, Instance, addDisposer, SnapshotIn, SnapshotOrInstance, cast } from 'mobx-state-tree';

import { needsConfig, TileLayer, ImageLayer, ITileLayer, IImageLayer } from '@oida/state-mst';

import { DatasetMapViz } from '../dataset-viz';

export const RASTER_VIZ_TYPE = 'raster';

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

export enum ColormapConfigMode {
    None = 'None',
    Presets = 'Presets',
    Customizable = 'Customizable'
}

export type DataDomain = {
    min: number;
    max: number;
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

export type DatasetRasterMapVizConfig = {
    bandMathConfig?: BandMathConfig;
    colorMapConfig?: ColorMapConfig;
    nonTiled?: boolean;
    rasterSourceProvider: (rasterViz) => any;
    afterInit?: (rasterViz) => void;
};

export const BandMathPreset = types.model('BandMathPreset', {
    mode: types.literal('preset'),
    preset: types.string
});

export const BandMathCombination = types.model('BandMathCombination', {
    mode: types.literal('combination'),
    red: types.string,
    green: types.string,
    blue: types.string
});

export const BandMathFormula = types.model('BandMathFormula', {
    mode: types.literal('formula'),
    formula: types.string
});

const BandMath = types.union(BandMathPreset, BandMathCombination, BandMathFormula);


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

export const ColorMapPreset = types.compose(
    'ColorMapPreset',
    ColorMapBase,
    types.model({
        mode: types.literal('preset')
    })
);

export const ColorMapCustom = types.compose(
    'ColorMapCustom',
    ColorMapBase,
    types.model({
        mode: types.literal('custom'),
        domain: types.frozen<DataDomain>(),
        clamp: types.optional(types.boolean, true)
    }).actions(self => ({
        setDomain: (domain: DataDomain) => {
            self.domain = domain;
        },
        setClamp: (clamp: boolean) => {
            self.clamp = clamp;
        }
    }))
);


export const ColorMap = types.union(ColorMapPreset, ColorMapCustom);


export const DatasetRasterViz = DatasetMapViz.addModel(
    types.compose(
        RASTER_VIZ_TYPE,
        types.model({
            bandMath: types.maybe(BandMath),
            colorMap: types.maybe(ColorMap),
            mapLayer: types.maybe(types.union(TileLayer, ImageLayer))
        }),
        needsConfig<DatasetRasterMapVizConfig>()
    )
    .actions((self) => {
        return {
            setMapLayer: (layer) => {
                self.mapLayer = layer;
            },
            setBandMath: (bandMath: SnapshotOrInstance<typeof BandMath> | undefined) => {
                self.bandMath = bandMath;
            },
            setColorMap: (colorMap: SnapshotOrInstance<typeof ColorMap> | undefined) => {
                self.colorMap = cast(colorMap);
            }
        };
    })
    .actions((self) => ({
        afterAttach: () => {

            if (self.config.bandMathConfig) {
                self.setBandMath(self.config.bandMathConfig.default);
            }
            if (self.config.colorMapConfig) {
                self.setColorMap(self.config.colorMapConfig.default);
            }

            let mapLayer: ITileLayer | IImageLayer;
            if (self.config.nonTiled) {
                mapLayer = ImageLayer.create({
                    id: `${(self as IDatasetRasterViz).dataset.id}rasterView`
                });
            } else {
                mapLayer = TileLayer.create({
                    id: `${(self as IDatasetRasterViz).dataset.id}rasterView`
                });
            }

            self.setMapLayer(mapLayer);

            let visibilityUpdateDisposer = autorun(() => {
                mapLayer.setVisible((self as IDatasetRasterViz).active);
            });

            let sourceUpdateDisposer = autorun(() => {
                let sourceConfig = self.config.rasterSourceProvider(self);
                mapLayer.setSource(sourceConfig);
                mapLayer.setExtent(sourceConfig.extent);
            });

            if (self.config.afterInit) {
                self.config.afterInit(self);
            }

            addDisposer(self, () => {
                visibilityUpdateDisposer();
                sourceUpdateDisposer();
            });

        }
    }))

);

export type IDatasetRasterViz = Instance<typeof DatasetRasterViz>;
