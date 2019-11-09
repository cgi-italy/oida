import { autorun } from 'mobx';
import { types, Instance, addDisposer, SnapshotIn, SnapshotOrInstance } from 'mobx-state-tree';

import { needsConfig, TileLayer } from '@oida/state-mst';

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

export type ColorMapConfig = {
    mode: ColormapConfigMode;
    presets?: Array<{
        id: string;
        name: string;
        legend: React.ReactNode;
    }>
};

export type DatasetRasterMapVizConfig = {
    bandMathConfig?: BandMathConfig;
    colorMapConfig?: ColorMapConfig;
    rasterSourceProvider: (rasterViz) => any;
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

export const ColorMap = types.model('ColorMap', {
    preset: types.maybe(types.string)
});


export const DatasetRasterViz = DatasetMapViz.addModel(
    types.compose(
        RASTER_VIZ_TYPE,
        types.model({
            bandMath: types.maybe(BandMath),
            colorMap: types.maybe(ColorMap),
            mapLayer: types.maybe(TileLayer)
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
            }
        };
    })
    .actions((self) => ({
        afterAttach: () => {

            if (self.config.bandMathConfig) {
                self.setBandMath(self.config.bandMathConfig.default);
            }

            let tileLayer = TileLayer.create({
                id: `${(self as IDatasetRasterViz).dataset.id}rasterView`
            });

            self.setMapLayer(tileLayer);


            let visibilityUpdateDisposer = autorun(() => {
                tileLayer.setVisible((self as IDatasetRasterViz).active);
            });

            let sourceUpdateDisposer = autorun(() => {
                let sourceConfig = self.config.rasterSourceProvider(self);
                tileLayer.setSource(sourceConfig);
                tileLayer.setExtent(sourceConfig.extent);
            });

            addDisposer(self, () => {
                visibilityUpdateDisposer();
                sourceUpdateDisposer();
            });

        }
    }))

);

export type IDatasetRasterViz = Instance<typeof DatasetRasterViz>;
