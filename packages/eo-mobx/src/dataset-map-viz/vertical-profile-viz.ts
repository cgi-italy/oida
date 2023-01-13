import { autorun, IObservableArray, observable, makeObservable, runInAction, action, computed } from 'mobx';

import { LoadingState, IVerticalProfile, IVerticalProfileStyle, TileSource, SubscriptionTracker } from '@oidajs/core';
import {
    VerticalProfileLayer,
    Selected,
    Hovered,
    SelectedProps,
    HoveredProps,
    IsSelectable,
    IsHoverable,
    HasVisibility,
    Visible,
    VisibleProps,
    AsyncDataFetcher
} from '@oidajs/state-mobx';

import { DatasetDimension, DatasetViz, DatasetVizProps, DimensionDomainType } from '../common';
import { DatasetPointSeriesValueItem } from '../dataset-analytics';
import { RasterBandModeConfig, RasterBandMode, RasterBandModeType } from './raster-band-mode';
import { getRasterBandModeFromConfig } from '../utils';
import { VerticalScale, VerticalScaleProps } from './vertical-scale';

export const VERTICAL_PROFILE_VIZ_TYPE = 'dataset_vertical_profile_viz';

export type VerticalProfileItemProps = {
    id: string;
    name?: string;
    geometry: IVerticalProfile;
    style: Omit<IVerticalProfileStyle, 'visible'>;
} & VisibleProps &
    SelectedProps &
    HoveredProps;

export class VerticalProfileItem implements HasVisibility, IsSelectable, IsHoverable {
    readonly id: string;
    readonly name: string | undefined;
    readonly visible: Visible;
    readonly selected: Selected;
    readonly hovered: Hovered;
    @observable.ref geometry: IVerticalProfile;
    @observable.ref style: Omit<IVerticalProfileStyle, 'visible'>;

    constructor(props: VerticalProfileItemProps) {
        this.id = props.id;
        this.name = props.name;
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
    profileId: string;
    direction: 'horizontal' | 'vertical';
    coordIndex: number;
};

export type VerticalProfileLineSeriesItem = DatasetPointSeriesValueItem<number> & {
    imageCoord: {
        x: number;
        y: number;
    };
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
        forward: (profileId: string, profileCoord: number[]) => Promise<number[] | undefined>;
        inverse: (profileId: string, geographicCoord: number[]) => Promise<number[] | undefined>;
    };
    lineSeriesProvider?: (request: VerticalProfileSeriesProviderRequest) => Promise<VerticalProfileLineSeriesItemResponse>;
    verticalScaleConfig?: {
        min: number;
        max: number;
        step?: number;
        default?: number;
    };
    afterInit?: (verticalProfileViz) => void;
    dimensions?: (DatasetDimension<DimensionDomainType> & {
        allowRange?: boolean;
    })[];
};

export type DatasetVerticalProfileVizProps = Omit<
    DatasetVizProps<typeof VERTICAL_PROFILE_VIZ_TYPE, VerticalProfileVizConfig>,
    'dimensions' | 'currentVariable' | 'initDimensions'
> &
    VerticalScaleProps;

export class DatasetVerticalProfileViz extends DatasetViz<typeof VERTICAL_PROFILE_VIZ_TYPE, VerticalProfileLayer<VerticalProfileItem>> {
    readonly config: VerticalProfileVizConfig;
    @observable verticalScale: VerticalScale;
    @observable tileSourceRevision: number;
    profiles: IObservableArray<VerticalProfileItem>;
    readonly bandMode: RasterBandMode;

    @observable protected widgetName_: string;
    protected subscriptionTracker_: SubscriptionTracker;
    protected profileGetter_: AsyncDataFetcher<VerticalProfileItemProps[], undefined>;

    constructor(props: Omit<DatasetVerticalProfileVizProps, 'vizType'>) {
        super({
            ...props,
            dimensions: props.config.dimensions,
            currentVariable: () => (this.bandMode.value?.type === RasterBandModeType.Single ? this.bandMode.value.band : undefined),
            initDimensions: true,
            dimensionValues: props.dimensionValues,
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

        this.profileGetter_ = new AsyncDataFetcher({
            dataFetcher: () => {
                return this.config.dataProvider.getProfiles(this);
            }
        });

        this.widgetName_ = this.dataset.config.name;

        this.bandMode = new RasterBandMode({
            config: props.config.bandMode
        });
        getRasterBandModeFromConfig({
            config: props.config.bandMode
        }).then((bandModeProps) => {
            this.bandMode.setValue(bandModeProps);
        });

        makeObservable(this);

        this.afterInit_();
    }

    @computed
    get widgetName() {
        return this.widgetName_;
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
            this.config.dataProvider.getProfileData(item.id).then(
                (data) => {
                    item.setStyle({
                        fillImage: data
                    });
                    onItemReady(true);
                },
                () => {
                    onItemReady(false);
                }
            );
        });
    }

    @action
    refreshTileView() {
        this.tileSourceRevision++;
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    @action
    setWidgetName_(name: string) {
        this.widgetName_ = name;
    }

    protected afterInit_() {
        const dataUpdaterDisposer = autorun(() => {
            this.mapLayer.loadingStatus.setValue(LoadingState.Loading);
            runInAction(() => {
                this.profiles.clear();
            });
            this.profileGetter_
                .fetchData(undefined)
                .then((profileData) => {
                    const profiles = profileData.map((profile) => {
                        return new VerticalProfileItem(profile);
                    });
                    runInAction(() => {
                        this.profiles.push(...profiles);
                        this.mapLayer.loadingStatus.setValue(LoadingState.Success);
                    });
                })
                .catch((error) => {
                    this.mapLayer.loadingStatus.update({
                        value: LoadingState.Error,
                        message: error.message
                    });
                });
        });

        const widgetVisibilityDisposer = autorun(() => {
            const selectedProfile = this.profiles.find((profile) => profile.selected.value);
            if (selectedProfile) {
                if (selectedProfile.name) {
                    this.setWidgetName_(`${this.dataset.config.name}: ${selectedProfile.name}`);
                } else {
                    this.setWidgetName_(this.dataset.config.name);
                }
                this.setWidgetVisible(true);
            } else {
                this.setWidgetName_(this.dataset.config.name);
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
                    const geometry = item.geometry;

                    let scaledHeight: number | number[];
                    if (Array.isArray(geometry.height)) {
                        scaledHeight = geometry.height.map((height) => height * this.verticalScale.value);
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
            }
        });
    }
}
