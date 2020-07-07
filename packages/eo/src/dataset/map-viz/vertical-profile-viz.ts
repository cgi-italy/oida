import { autorun } from 'mobx';
import { types, addDisposer, Instance, applySnapshot } from 'mobx-state-tree';

import { LoadingState } from '@oida/core';
import { hasConfig, VerticalProfileLayer } from '@oida/state-mst';

import { DatasetViz } from '../dataset-viz';
import { DatasetDimensionSeriesValueItem } from '../analysis';
import { ColorMapConfig, ColorMap } from './color-map';

import { DatasetVerticalProfiles, IDatasetVerticalProfile, VerticalProfileItem } from './dataset-vertical-profile';

export const VERTICAL_PROFILE_VIZ_TYPE = 'vertical_profile';

export interface VerticalProfileDataProvider {
    getProfiles: (verticalProfileViz) => Promise<VerticalProfileItem[]>;
    getProfileData: (profileId) => Promise<string>;
    getLineSeries?: (request: VerticalProfileSeriesProviderRequest) => Promise<VerticalProfileLineSeriesItemResponse>;
}

export type VerticalProfileSeriesProviderRequest = {
    profileId: string,
    direction: 'horizontal' | 'vertical',
    coordIndex: number;
};

export type VerticalProfileLineSeriesItem = DatasetDimensionSeriesValueItem<number> & {
    imageCoord: {
        x: number,
        y: number
    }
};

export type VerticalProfileLineSeriesItemResponse = {
    subsample: number;
    data: VerticalProfileLineSeriesItem[];
};


export type VerticalProfileVizConfig = {
    colorMapConfig: ColorMapConfig;
    dataProvider: VerticalProfileDataProvider;
    tileSourceProvider?: (verticalProfileViz, profileId: string) => Promise<any>;
    profileCoordTransform?: {
        forward: (profileId: string, profileCoord: number[]) => Promise<number[] | undefined>,
        inverse: (profileId: string, geographicCoord: number[]) => Promise<number[] | undefined>
    },
    lineSeriesProvider?: (request: VerticalProfileSeriesProviderRequest) => Promise<VerticalProfileLineSeriesItemResponse>,
    verticalScaleConfig?: {
        min: number,
        max: number,
        step?: number,
        default?: number
    },
    afterInit?: (verticalProfileViz) => void;
};

const DatasetVerticalProfileVizDecl = DatasetViz.addModel(
    types.compose(
        VERTICAL_PROFILE_VIZ_TYPE,
        types.model({
            colorMap: types.maybe(ColorMap),
            mapLayer: types.maybe(VerticalProfileLayer),
            verticalScale: types.optional(types.number, 1),
            verticalProfiles: types.optional(DatasetVerticalProfiles, {}),
            tileSourceRevision: types.optional(types.number, 0)
        }),
        hasConfig<VerticalProfileVizConfig>()
    ).actions((self) => {
        return {
            setColorMap: (colorMap) => {
                self.colorMap = colorMap;
            },
            setVerticalScale: (verticalScale) => {
                self.verticalScale = verticalScale;
            },
            refreshData: () => {
                const mapLayer = self.mapLayer!;
                mapLayer.setLoadingState(LoadingState.Loading);
                let pendingItem = self.verticalProfiles.items.length;

                const onItemReady = (sucess: boolean) => {
                    pendingItem--;
                    if (!pendingItem) {
                        mapLayer.setLoadingState(LoadingState.Success);
                    }
                };

                self.verticalProfiles.items.forEach((item) => {
                    self.config.dataProvider.getProfileData(item.id).then(data => {
                        item.setStyle({
                            fillImage: data
                        });
                        onItemReady(true);
                    }, () => {
                        onItemReady(false);
                    });
                });
            },
            refreshTileView: () => {
                self.tileSourceRevision++;
            }
        };
    })
    .actions((self) => {
        return {
            afterAttach: () => {
                self.setColorMap(self.config.colorMapConfig.default);

                let verticalScaleConfig = self.config.verticalScaleConfig;
                if (verticalScaleConfig && verticalScaleConfig.default) {
                    self.setVerticalScale(verticalScaleConfig.default);
                }

                let mapLayer = VerticalProfileLayer.create({
                    id: `${(self as IDatasetVerticalProfileViz).dataset.id}verticalProfileView`,
                    source: self.verticalProfiles.id,
                    config: {
                        profileGetter: (verticalProfile) => {
                            let geometry = verticalProfile.geometry;

                            let scaledHeight: number | number[];
                            if (Array.isArray(geometry.height)) {
                                scaledHeight = geometry.height.map(height => height * self.verticalScale);
                            } else {
                                scaledHeight = geometry.height * self.verticalScale;
                            }

                            return {
                                ...geometry,
                                height: scaledHeight
                            };
                        },
                        styleGetter: (verticalProfile) => ({
                            ...verticalProfile.style,
                            visible: verticalProfile.visible,
                            fillColor: [1.0, 1.0, 1.0, mapLayer.opacity]
                        })
                    }
                });

                self.mapLayer = mapLayer;

                let visibilityUpdateDisposer = autorun(() => {
                    mapLayer.setVisible((self as IDatasetVerticalProfileViz).active);
                });

                let dataUpdaterDisposer = autorun(() => {
                    mapLayer.setLoadingState(LoadingState.Loading);
                    self.config.dataProvider.getProfiles(self).then((profileData) => {
                        applySnapshot(self.verticalProfiles.items, profileData);
                        mapLayer.setLoadingState(LoadingState.Success);
                    }).catch((error) => {
                        self.verticalProfiles.clear();
                        mapLayer.setLoadingState(LoadingState.Error);
                    });
                });

                if (self.config.afterInit) {
                    self.config.afterInit(self);
                }
                addDisposer(self, dataUpdaterDisposer);
                addDisposer(self, visibilityUpdateDisposer);
            }
        };
    })
);

type DatasetVerticalProfileVizType = typeof DatasetVerticalProfileVizDecl;
export interface DatasetVerticalProfileVizInterface extends DatasetVerticalProfileVizType {}
export const DatasetVerticalProfileViz: DatasetVerticalProfileVizInterface = DatasetVerticalProfileVizDecl;
export interface IDatasetVerticalProfileViz extends Instance<DatasetVerticalProfileVizInterface> {}
