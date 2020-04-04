import { autorun } from 'mobx';
import { types, Instance, addDisposer, SnapshotIn, SnapshotOrInstance, cast } from 'mobx-state-tree';

import { hasConfig, TileLayer } from '@oida/state-mst';

import { DatasetMapViz } from '../dataset-viz';
import { ColorMap, ColorMapConfig } from './raster-map-viz';

export const VOLUME_VIZ_TYPE = 'volume';

export type DataVerticalDomain = {
    min: number;
    max: number;
    step?: number;
    default?: SnapshotIn<typeof VerticalStack>
};

export type DatasetVolumeMapVizConfig = {
    colorMapConfig?: ColorMapConfig;
    stackSourceProvider: (volumeViz) => any;
    verticalDomain: DataVerticalDomain;
    afterInit?: (volumeViz) => void;
};

export const VerticalStack = types.model({
    min: types.number,
    max: types.maybe(types.number),
    step: types.maybe(types.number)
}).views(self => ({
    get slice() {
        return self.max
        ? {
            min: self.min,
            max: self.max,
            step: self.step || 1
        }
        : self.min;
    }
}));

export const DatasetVolumeViz = DatasetMapViz.addModel(
    types.compose(
        VOLUME_VIZ_TYPE,
        types.model({
            colorMap: types.maybe(ColorMap),
            mapLayer: types.maybe(TileLayer),
            verticalStack: types.maybe(VerticalStack)
        }),
        hasConfig<DatasetVolumeMapVizConfig>()
    )
    .actions((self) => {
        return {
            setMapLayer: (layer) => {
                self.mapLayer = layer;
            },
            setColorMap: (colorMap: SnapshotOrInstance<typeof ColorMap> | undefined) => {
                self.colorMap = cast(colorMap);
            },
            setVerticalStack: (verticalStack: SnapshotOrInstance<typeof VerticalStack> | undefined) => {
                self.verticalStack = cast(verticalStack);
            }
        };
    })
    .actions((self) => ({
        afterAttach: () => {

            if (self.config.colorMapConfig) {
                self.setColorMap(self.config.colorMapConfig.default);
            }

            if (self.config.verticalDomain && self.config.verticalDomain.default) {
                self.setVerticalStack(self.config.verticalDomain.default);
            }

            let mapLayer = TileLayer.create({
                id: `${(self as IDatasetVolumeViz).dataset.id}rasterView`
            });

            self.setMapLayer(mapLayer);

            let visibilityUpdateDisposer = autorun(() => {
                mapLayer.setVisible((self as IDatasetVolumeViz).active);
            });

            let sourceUpdateDisposer = autorun(() => {
                let sourceConfig = self.config.stackSourceProvider(self);
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

export type IDatasetVolumeViz = Instance<typeof DatasetVolumeViz>;
