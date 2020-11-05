import { autorun, IObservableArray, observable, makeObservable, runInAction, action } from 'mobx';

import { LoadingState, IVerticalProfile, IVerticalProfileStyle, TileSource, SubscriptionTracker } from '@oida/core';
import {
    VerticalProfileLayer, Selected, Hovered, SelectedProps, HoveredProps,
    IsSelectable, IsHoverable, HasVisibility, Visible, VisibleProps
} from '@oida/state-mobx';

import { DatasetViz, DatasetVizProps } from './dataset-viz';
import { DatasetDimensionSeriesValueItem } from './dataset-dimension-series';
import { RasterBandModeConfig, RasterBandMode } from './raster-band-mode';
import { getRasterBandModeFromConfig } from '../utils/get-raster-band-mode-from-config';
import { VerticalScale, VerticalScaleProps } from './vertical-scale';

export const VERTICAL_PROFILE_VIZ_TYPE = 'vertical_profile';

export type VerticalProfileItemProps = {
    id: string;
    geometry: IVerticalProfile,
    style: Omit<IVerticalProfileStyle, 'visible'>;
} & VisibleProps & SelectedProps & HoveredProps;

export class VerticalProfileItem implements HasVisibility, IsSelectable, IsHoverable {
    readonly id: string;
    readonly visible: Visible;
    readonly selected: Selected;
    readonly hovered: Hovered;
    @observable.ref geometry: IVerticalProfile;
    @observable.ref style: Omit<IVerticalProfileStyle, 'visible'>;

    constructor(props: VerticalProfileItemProps) {
        this.id = props.id;
        this.visible = new Visible(props);
        this.selected = new Selected(props);
        this.hovered = new Hovered(props);
        this.geometry = props.geometry;
        this.style = props.style;

        makeObservable(this);
    }

    @action
    setGeometry(geometry: IVerticalProfile) {
        this.geometry = geometry;
    }

    @action
    setStyle(style: Omit<IVerticalProfileStyle, 'visible'>) {
        this.style = style;
    }
}


export interface VerticalProfileDataProvider {
    getProfiles: (verticalProfileViz: DatasetVerticalProfileViz) => Promise<VerticalProfileItemProps[]>;
    getProfileData: (profileId: string) => Promise<string>;
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
    bandMode: RasterBandModeConfig;
    dataProvider: VerticalProfileDataProvider;
    tileSourceProvider?: (verticalProfileViz: DatasetVerticalProfileViz, profileId: string) => Promise<TileSource>;
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

export type DatasetVerticalProfileVizProps = {
    config: VerticalProfileVizConfig;
} & DatasetVizProps & VerticalScaleProps;

export class DatasetVerticalProfileViz extends DatasetViz<VerticalProfileLayer<VerticalProfileItem>> {
    readonly config: VerticalProfileVizConfig;
    @observable verticalScale: VerticalScale;
    @observable tileSourceRevision: number;
    profiles: IObservableArray<VerticalProfileItem>;
    readonly bandMode: RasterBandMode;

    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: Omit<DatasetVerticalProfileVizProps, 'vizType'>) {
        super({
            ...props,
            vizType: VERTICAL_PROFILE_VIZ_TYPE
        });

        this.config = props.config;

        this.verticalScale = new VerticalScale(props);
        const verticalScaleConfig = this.config.verticalScaleConfig;
        if (verticalScaleConfig && verticalScaleConfig.default) {
            this.verticalScale.setValue(verticalScaleConfig.default);
        }

        this.tileSourceRevision = 0;

        this.profiles = observable.array([], {
            deep: false
        });
        this.mapLayer.setSource(this.profiles);

        this.subscriptionTracker_ = new SubscriptionTracker();

        this.bandMode = new RasterBandMode();
        getRasterBandModeFromConfig({
            config: props.config.bandMode
        }).then((bandModeProps) => {
            this.bandMode.setValue(bandModeProps);
        });

        makeObservable(this);

        this.afterInit_();
    }

    @action
    refreshData() {
        this.mapLayer.loadingStatus.setValue(LoadingState.Loading);
        let pendingItem = this.profiles.length;

        const onItemReady = (sucess: boolean) => {
            pendingItem--;
            if (!pendingItem) {
                this.mapLayer.loadingStatus.setValue(LoadingState.Success);
            }
        };

        this.profiles.forEach((item) => {
            this.config.dataProvider.getProfileData(item.id).then(data => {
                item.setStyle({
                    fillImage: data
                });
                onItemReady(true);
            }, () => {
                onItemReady(false);
            });
        });
    }

    @action
    refreshTileView() {
        this.tileSourceRevision++;
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
    }

    protected afterInit_() {
        const dataUpdaterDisposer = autorun(() => {
            this.mapLayer.loadingStatus.setValue(LoadingState.Loading);
            runInAction(() => {
                this.profiles.clear();
            });
            this.config.dataProvider.getProfiles(this).then((profileData) => {
                const profiles = profileData.map((profile) => {
                    return new VerticalProfileItem(profile);
                });
                this.profiles.push(...profiles);
                this.mapLayer.loadingStatus.setValue(LoadingState.Success);
            }).catch((error) => {
                this.mapLayer.loadingStatus.setValue(LoadingState.Error);
            });
        });

        const widgetVisibilityDisposer = autorun(() => {
            const selectedProfile = this.profiles.find(profile => profile.selected.value);
            if (selectedProfile) {
                this.setWidgetVisible(true);
            } else {
                this.setWidgetVisible(false);
            }
        });

        this.subscriptionTracker_.addSubscription(dataUpdaterDisposer);
        this.subscriptionTracker_.addSubscription(widgetVisibilityDisposer);

        if (this.config.afterInit) {
            this.config.afterInit(this);
        }
    }

    protected initMapLayer_() {
        return new VerticalProfileLayer<VerticalProfileItem>({
            id: `${this.dataset.id}verticalProfileView`,
            source: undefined,
            config: {
                profileGetter: (item) => {
                    let geometry = item.geometry;

                    let scaledHeight: number | number[];
                    if (Array.isArray(geometry.height)) {
                        scaledHeight = geometry.height.map(height => height * this.verticalScale.value);
                    } else {
                        scaledHeight = geometry.height * this.verticalScale.value;
                    }

                    return {
                        ...geometry,
                        height: scaledHeight
                    };
                },
                styleGetter: (item) => ({
                    ...item.style,
                    visible: item.visible.value,
                    fillColor: [1.0, 1.0, 1.0, this.mapLayer.opacity.value]
                })
            },
        });
    }
}

DatasetViz.register(VERTICAL_PROFILE_VIZ_TYPE, DatasetVerticalProfileViz);
