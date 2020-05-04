import { autorun } from 'mobx';
import { types, Instance, addDisposer, applySnapshot, SnapshotOrInstance, cast } from 'mobx-state-tree';

import { VolumeSourceConfig } from '@oida/core';
import { hasConfig, VolumeLayer } from '@oida/state-mst';

import { DatasetViz } from '../dataset-viz';
import { ColorMap, ColorMapConfig } from './color-map';

export const VOLUMETRIC_VIZ_TYPE = 'volumetric';

type DataVerticalDomain = {
    min: number;
    max: number;
    step?: number;
};

export type DatasetVolumetricMapVizConfig = {
    colorMapConfig?: ColorMapConfig;
    verticalDomain: DataVerticalDomain;
    volumeSourceProvider: (volumetricViz) => VolumeSourceConfig;
    verticalScaleConfig?: {
        min: number,
        max: number,
        step?: number,
        default?: number
    },
    afterInit?: (volumetricViz) => void;
};


const DatasetVolumetricVizDecl = DatasetViz.addModel(
    types.compose(
        VOLUMETRIC_VIZ_TYPE,
        types.model({
            colorMap: types.maybe(ColorMap),
            mapLayer: types.maybe(VolumeLayer)
        }),
        hasConfig<DatasetVolumetricMapVizConfig>()
    )
    .actions((self) => {
        return {
            setMapLayer: (layer) => {
                self.mapLayer = layer;
            },
            setColorMap: (colorMap: SnapshotOrInstance<typeof ColorMap> | undefined) => {
                self.colorMap = cast(colorMap);
            },
            setVerticalScale: (verticalScale: number) => {
                self.mapLayer?.setVerticalScale(verticalScale);
            }
        };
    })
    .views((self) => {
        return {
            get verticalScale() {
                return self.mapLayer ? self.mapLayer.verticalScale : 1;
            }
        };
    })
    .actions((self) => {

        const getLayerColorMap = () => {

            const colorMap = self.colorMap;
            if (colorMap && colorMap.mode === 'custom') {
                const preset = colorMap.preset;
                if (preset) {
                    let presetConfig = self.config.colorMapConfig?.colorMaps?.find(colorMap => colorMap.id === preset);
                    if (presetConfig) {
                        return {
                            image: presetConfig.legend,
                            noData: colorMap.noDataValue !== undefined ? colorMap.noDataValue : Number.MAX_VALUE,
                            range: colorMap.domain,
                            clamp: colorMap.clamp
                        };
                    }
                }
            }
        };

        return {
            afterAttach: () => {

                if (self.config.colorMapConfig) {
                    self.setColorMap(self.config.colorMapConfig.default);
                }

                let mapLayer = VolumeLayer.create({
                    id: `${(self as IDatasetVolumetricViz).dataset.id}volumetricView`,
                    viewMode: {
                        mode: 'stackView',
                        numSlices: 8
                    },
                    colorMap: getLayerColorMap(),
                    verticalScale: self.config.verticalScaleConfig ? self.config.verticalScaleConfig.default : undefined
                });

                self.setMapLayer(mapLayer);

                let visibilityUpdateDisposer = autorun(() => {
                    mapLayer.setVisible((self as IDatasetVolumetricViz).active);
                });

                let sourceUpdateDisposer = autorun(() => {
                    let sourceConfig = self.config.volumeSourceProvider(self);
                    mapLayer.setSource(sourceConfig);
                });

                let colormapUpdateDisposer = autorun(() => {
                    let layerColorMap = getLayerColorMap();
                    if (layerColorMap && mapLayer.colorMap) {
                        applySnapshot(mapLayer.colorMap, layerColorMap);
                    }
                });

                if (self.config.afterInit) {
                    self.config.afterInit(self);
                }

                addDisposer(self, () => {
                    visibilityUpdateDisposer();
                    sourceUpdateDisposer();
                    colormapUpdateDisposer();
                });

            }
        };
    })

);

type DatasetVolumetricVizType = typeof DatasetVolumetricVizDecl;
export interface DatasetVolumetricVizInterface extends DatasetVolumetricVizType {}
export const DatasetVolumetricViz: DatasetVolumetricVizInterface = DatasetVolumetricVizDecl;
export interface IDatasetVolumetricViz extends Instance<DatasetVolumetricVizInterface> {}
