import { autorun } from 'mobx';
import { types, Instance, addDisposer, SnapshotIn, SnapshotOrInstance, cast } from 'mobx-state-tree';

import { hasConfig, TileLayer, ImageLayer, ITileLayer, IImageLayer } from '@oida/state-mst';

import { DatasetViz } from '../dataset-viz';
import { ColorMapConfig, ColorMap } from './color-map';
import { BandMathConfig, BandMath } from './band-math';
import { hasDimensions } from '../has-dimensions';
import { DatasetDimension, DataDomain, isValueDomain } from '../dataset-variable';
import { LoadingState } from '@oida/core';

export const RASTER_VIZ_TYPE = 'raster';

export type DatasetRasterMapVizConfig = {
    bandMathConfig?: BandMathConfig;
    colorMapConfig?: ColorMapConfig;
    dimensions?: DatasetDimension<DataDomain<string | number>>[];
    nonTiled?: boolean;
    rasterSourceProvider: (rasterViz) => Promise<any>;
    afterInit?: (rasterViz) => void;
};

const DatasetRasterVizLayerDecl = types.union(TileLayer, ImageLayer);
type DatasetRasterVizLayerType = typeof DatasetRasterVizLayerDecl;
export interface DatasetRasterVizLayerInterface extends DatasetRasterVizLayerType {}
const DatasetRasterVizLayer: DatasetRasterVizLayerInterface = DatasetRasterVizLayerDecl;

const DatasetRasterVizDecl = DatasetViz.addModel(
    types.compose(
        RASTER_VIZ_TYPE,
        types.model({
            bandMath: types.maybe(BandMath),
            colorMap: types.maybe(ColorMap),
            mapLayer: types.maybe(DatasetRasterVizLayer)
        }),
        hasDimensions,
        hasConfig<DatasetRasterMapVizConfig>()
    )
    .actions((self) => {
        return {
            setBandMath: (bandMath: SnapshotOrInstance<typeof BandMath> | undefined) => {
                self.bandMath = cast(bandMath);
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
            if (self.config.dimensions) {
                self.config.dimensions.forEach((dimension) => {
                    if (dimension.domain) {
                        if (isValueDomain(dimension.domain)) {
                            self.setDimensionValue(dimension.id, dimension.domain.min);
                        } else {
                            self.setDimensionValue(dimension.id, dimension.domain[0].value);
                        }
                    }
                });
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

            self.mapLayer = mapLayer;

            let visibilityUpdateDisposer = autorun(() => {
                mapLayer.setVisible((self as IDatasetRasterViz).active);
            });

            let sourceUpdateDisposer = autorun(() => {
                mapLayer.setSource(undefined);
                mapLayer.setLoadingProps({
                    state: LoadingState.Loading,
                    percentage: 30
                });
                self.config.rasterSourceProvider(self).then((sourceConfig) => {
                    mapLayer.setSource(sourceConfig);
                    if (sourceConfig) {
                        mapLayer.setExtent(sourceConfig.extent);
                        (mapLayer as ITileLayer).setMinZoomLevel(sourceConfig.minZoomLevel);
                        (mapLayer as ITileLayer).setMaxZoomLevel(sourceConfig.maxZoomLevel);
                    }
                }).finally(() => {
                    mapLayer.setLoadingProps({
                        state: LoadingState.Init
                    });
                });

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

type DatasetRasterVizType = typeof DatasetRasterVizDecl;
export interface DatasetRasterVizInterface extends DatasetRasterVizType {}
export const DatasetRasterViz: DatasetRasterVizInterface = DatasetRasterVizDecl;
export interface IDatasetRasterViz extends Instance<DatasetRasterVizInterface> {}

