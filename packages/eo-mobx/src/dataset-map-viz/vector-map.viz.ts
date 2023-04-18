import { action, autorun, computed, IObservableArray, makeObservable, observable, reaction, runInAction } from 'mobx';
import chroma from 'chroma-js';

import { Geometry, LoadingState, randomColorFactory, SubscriptionTracker } from '@oidajs/core';
import {
    DataFilters,
    DataFiltersProps,
    FeatureLayer,
    FeatureStyleGetter,
    HasVisibility,
    Hovered,
    HoveredProps,
    IsHoverable,
    IsSelectable,
    Selected,
    SelectedProps,
    Visible,
    VisibleProps
} from '@oidajs/state-mobx';

import { ColorMap, ColorScale, DatasetDimension, DatasetViz, DatasetVizProps, DimensionDomainType, DiscreteColorMap } from '../common';
import { EnumFeaturePropertyDescriptor, VectorFeatureDescriptor, VectorFeatureProperties } from './vector-feature-descriptor';
import { createPropertiesDescriptorFromFeatures } from '../utils';
/**
 * Default feature style factory for {@link DatasetVectorMapViz}. Used when no featureStyleFactory is
 * provided in {@link DatasetVectorMapVizConfig}
 * @param color A color string. In a nominal scenario the Dataset color is passed here.
 * @returns The map layer feature style function
 */
export const defaultVectoreFeatureStyleFactory = (color?: string) => {
    const defaultColor = chroma(color || '0000AA');

    const featureStyleGetter: FeatureStyleGetter<DatasetVectorFeature> = (feature: DatasetVectorFeature) => {
        let color = feature.color ? chroma(feature.color) : defaultColor;
        let opacity = 0.1;

        if (feature.selected.value) {
            color = chroma(1.0, 1.0, 0.0, 'gl');
            opacity = 0.4;
        } else if (feature.hovered.value) {
            color = color.brighten(0.3);
            opacity = 0.2;
        }

        let zIndex = 0;
        if (feature.selected.value) {
            zIndex = 1;
        }
        if (feature.hovered.value) {
            zIndex = 2;
        }

        return {
            point: {
                visible: feature.visible.value,
                zIndex: zIndex,
                radius: 5,
                fillColor: color.gl()
            },
            line: {
                visible: feature.visible.value,
                zIndex: zIndex,
                width: feature.selected.value ? 3 : 2,
                color: color.gl()
            },
            polygon: {
                visible: feature.visible.value,
                strokeColor: color.gl(),
                strokeWidth: feature.selected.value ? 3 : 2,
                fillColor: color.alpha(opacity).gl(),
                zIndex: zIndex
            },
            ...(feature.label && {
                label: {
                    text: feature.label,
                    visible: feature.visible.value,
                    zIndex: zIndex,
                    fillColor: chroma('FEFEFE').gl(),
                    strokeColor: chroma('333').gl(),
                    strokeWidth: 1,
                    offsetY: 15,
                    scale: 1.5
                }
            })
        };
    };

    return featureStyleGetter;
};

export type DatasetVectorFeatureProps<T extends VectorFeatureProperties = VectorFeatureProperties> = {
    id: string;
    geometry: Geometry;
    properties: T;
    color?: string;
    label?: string;
} & VisibleProps &
    SelectedProps &
    HoveredProps;

export class DatasetVectorFeature<T extends VectorFeatureProperties = VectorFeatureProperties>
    implements HasVisibility, IsSelectable, IsHoverable
{
    readonly id: string;
    readonly visible: Visible;
    readonly selected: Selected;
    readonly hovered: Hovered;
    readonly geometry: Geometry;
    readonly properties: T;
    @observable.ref color: string | undefined;
    @observable.ref label: string | undefined;

    constructor(props: DatasetVectorFeatureProps<T>) {
        this.id = props.id;
        this.visible = new Visible(props);
        this.selected = new Selected(props);
        this.hovered = new Hovered(props);
        this.geometry = props.geometry;
        this.properties = props.properties;
        this.color = props.color;
        this.label = props.label;

        makeObservable(this);
    }

    @action
    setColor(color: string | undefined) {
        this.color = color;
    }

    @action
    setLabel(label: string | undefined) {
        this.label = label;
    }
}

export const VECTOR_VIZ_TYPE = 'dataset_vector_viz';

/**
 * The vector data provider type.
 */
export type VectorDataProvider = (vectorViz: DatasetVectorMapViz) => Promise<DatasetVectorFeatureProps[]>;

export type VectorDataGenerator = Generator<Promise<DatasetVectorFeatureProps[]>, void, void>;
export type VectorDataGeneratorFactory = (vectorViz: DatasetVectorMapViz) => VectorDataGenerator;

const isDataGenerator = function <T>(type: Generator<Promise<T>> | Promise<T>): type is Generator<Promise<T>> {
    return typeof (type as Generator<Promise<T>>).next === 'function';
};

/**
 * The configuration for a {@link DatasetVectorMapViz | dataset vector map visualization}
 */
export type DatasetVectorMapVizConfig = {
    /**
     * The function called to retrieve the data. It is called wrapped in a mobx autorun so that every time one of
     * the {@link DatasetVectorMapViz} properties accessed by the provider changes, the function is called again to
     * retrieve the new data
     */
    dataProvider: VectorDataProvider | VectorDataGeneratorFactory;
    /**
     * The feature type descriptor. If provided it will be used for dynamica feature styling, filtering and feature information
     * display.
     */
    featureDescriptor?: VectorFeatureDescriptor | ((vectorViz: DatasetVectorMapViz) => Promise<VectorFeatureDescriptor>);
    /**
     * The color scales to be used for dynamic feature coloring
     */
    colorScales?: Array<
        ColorScale & {
            colors: string[];
        }
    >;
    /**
     * The style factory function. It receive the dataset color as input and shall returns a feature style function
     * used as input for the internal {@link FeatureLayer}.
     */
    featureStyleFactory?: (color?: string) => FeatureStyleGetter<DatasetVectorFeature>;

    dimensions?: DatasetDimension<DimensionDomainType>[];
};

/**
 * The {@link DatasetVectorMapViz} constructor properties type
 */
export type DatasetVectorMapVizProps = Omit<
    DatasetVizProps<typeof VECTOR_VIZ_TYPE, DatasetVectorMapVizConfig>,
    'dimensions' | 'currentVariable' | 'initDimensions'
> & {
    /**
     * Optional {@link DatasetVectorMapViz.propertyFilters | DatasetVectorMapViz property filters} initialization
     */
    propertyFilters?: DataFiltersProps | DataFilters;
};

export class DatasetVectorMapViz extends DatasetViz<typeof VECTOR_VIZ_TYPE, FeatureLayer<DatasetVectorFeature>> {
    /** The visualization configuration */
    readonly config: DatasetVectorMapVizConfig;
    /** The feature descriptor */
    @observable.ref featureDescriptor: VectorFeatureDescriptor | undefined;
    /** The color map used for dynamic coloring */
    @observable.ref colorMap: ColorMap | undefined;
    /** The id of the feature property used for dynamic coloring */
    @observable.ref colorProperty: string | undefined;
    /** The color map used if the feature type is enum */
    @observable.ref discreteColorMap: DiscreteColorMap | undefined;
    /** The properties that will be shown by the label */
    @observable.ref labelProperties: string[] | undefined;
    /**
     * The property filters state. It is responsability of the {@link VectorDataProvider} to
     * filter the results based on the current filtering state
     */
    propertyFilters: DataFilters;
    /** The current feature array. Automatically filled from the {@link VectorDataProvider} response */
    protected data_: IObservableArray<DatasetVectorFeature>;
    /** The internal chroma scale used to update the {@link DatasetVectorFeature} color */
    @observable.ref protected chromaScale_: chroma.Scale | undefined;
    /** Internal subscriptions tracker */
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: Omit<DatasetVectorMapVizProps, 'vizType'>) {
        super({
            ...props,
            dimensionValues: props.dimensionValues,
            dimensions: props.config.dimensions,
            initDimensions: true,
            vizType: VECTOR_VIZ_TYPE
        });

        this.config = props.config;
        this.colorProperty = undefined;
        this.colorMap = undefined;
        this.discreteColorMap = undefined;
        this.chromaScale_ = undefined;

        this.propertyFilters =
            props.propertyFilters instanceof DataFilters ? props.propertyFilters : new DataFilters(props.propertyFilters);

        this.data_ = observable.array([], {
            deep: false
        });
        this.mapLayer.setSource(this.data_);

        if (typeof props.config.featureDescriptor !== 'function') {
            this.featureDescriptor = props.config.featureDescriptor;
            this.labelProperties = props.config.featureDescriptor?.labelProps;
        }

        this.subscriptionTracker_ = new SubscriptionTracker();

        makeObservable(this);

        this.afterInit_();
    }

    /**
     * Set the feature property used for coloring.
     * @param propertyId the feature property id
     */
    @action
    setColorProperty(propertyId: string | undefined) {
        if (propertyId === this.colorProperty) {
            return;
        }
        if (propertyId) {
            const featureProperty = this.featureDescriptor?.properties.find((feature) => feature.id === propertyId);
            if (featureProperty && featureProperty.type === 'number') {
                if (!this.config.colorScales?.length) {
                    this.colorProperty = undefined;
                    return;
                }
                if (!this.colorMap) {
                    this.colorMap = new ColorMap({
                        colorScale: this.config.colorScales[0].id
                    });
                }
                this.colorMap.setColorMapDomain({
                    mapRange: {
                        min: featureProperty.domain?.min || 0,
                        max: featureProperty.domain?.max || 100
                    },
                    clamp: this.colorMap.domain?.clamp
                });
                this.colorProperty = propertyId;
            } else if (featureProperty && featureProperty.type === 'enum') {
                const randomColor = randomColorFactory();
                this.discreteColorMap = new DiscreteColorMap({
                    items: featureProperty.options.map((value) => {
                        return {
                            value: value.value.toString(),
                            color: value.color ? chroma(value.color).hex() : chroma(randomColor()).hex()
                        };
                    })
                });
                this.colorProperty = propertyId;
            } else {
                this.colorProperty = undefined;
            }
        } else {
            this.colorProperty = undefined;
        }
    }

    @action
    setLabelProperties(labelProperties: string[] | undefined) {
        this.labelProperties = labelProperties;
    }

    /** The currently selected features */
    @computed
    get selectedFeatures() {
        return this.data_.filter((feature) => feature.selected.value);
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    /** Automatically called when the color map scale is updated */
    @action
    protected updateChromaScale_() {
        const colorScaleConfig = this.config.colorScales?.find((scale) => scale.id === this.colorMap?.colorScale);
        if (colorScaleConfig) {
            this.chromaScale_ = chroma.scale(colorScaleConfig?.colors);
            if (colorScaleConfig?.positions) {
                this.chromaScale_.domain(colorScaleConfig.positions);
            }
        } else {
            this.chromaScale_ = undefined;
        }
    }

    /**
     * Update feature colors based on the current {@link DatasetVectorMapViz.colorMap}
     * and {@link DatasetVectorMapViz.colorProperty}
     */
    @action
    protected updateFeatureColors_() {
        const colorGetter = this.featureColorGetter;
        this.data_.forEach((feature) => feature.setColor(colorGetter(feature)));
    }

    /**
     * Update the label showed on the map based on the {@link DatasetVectorMapViz.labelProperties}
     */
    @action
    protected updateFeatureLabel_() {
        const labelGetter = this.featureLabelGetter;
        this.data_.forEach((feature) => feature.setLabel(labelGetter(feature)));
    }

    @computed
    protected get featureLabelGetter() {
        if (this.labelProperties) {
            const labelIds: Record<string, string> = {};
            this.featureDescriptor?.properties.forEach((property) => {
                labelIds[property.id] = property.name;
            });
            return (feature) => {
                return this.labelProperties!.map((label) => {
                    return `${labelIds[label]}: ${feature.properties[label]}`;
                }).join('\n');
            };
        } else {
            return (feature) => {
                return undefined;
            };
        }
    }

    /**
     * The function used to update the {@link DatasetVectorFeature}. Every time one of the observable dendencies of this
     * function is updated, the {@link DatasetVectorMapViz.updateFeatureColors_} function is automatically called
     */
    @computed
    protected get featureColorGetter() {
        const colorProperty = this.colorProperty
            ? this.featureDescriptor?.properties.find((property) => property.id === this.colorProperty)
            : undefined;

        const colorMapDomain = this.colorMap?.domain?.mapRange;
        const clamp = this.colorMap?.domain?.clamp;
        const chromaScale = this.chromaScale_;
        if (colorProperty && colorProperty.type === 'number' && colorMapDomain && chromaScale) {
            return (feature) => {
                const rawValue = colorProperty.valueExtractor
                    ? colorProperty.valueExtractor(feature.properties)
                    : feature.properties[colorProperty.id];

                let value: number = colorProperty.parser ? colorProperty.parser(rawValue) : rawValue;
                value = (value - colorMapDomain.min) / (colorMapDomain.max - colorMapDomain.min);
                if (!clamp && (value < 0 || value > 1)) {
                    return 'rgba(255, 255, 255, 0)';
                } else {
                    return chromaScale(value).hex();
                }
            };
        } else if (colorProperty && colorProperty.type === 'enum') {
            return (feature) => {
                return this.discreteColorMap?.mapItems[feature.properties[colorProperty.id]];
            };
        } else {
            return (feature) => {
                return undefined;
            };
        }
    }

    /**
     * Update the feature data. Automatically called when new data is retrieved from the {@link VectorDataProvider}
     * @param data the new feature array
     */
    @action
    protected setData_(data: DatasetVectorFeatureProps[], append?: boolean) {
        if (!this.featureDescriptor && data.length) {
            // infer the feature descriptor from data
            this.featureDescriptor = {
                typeName: '',
                properties: createPropertiesDescriptorFromFeatures(data.map((feature) => feature.properties))
            };
        }
        const colorGetter = this.featureColorGetter;
        const labelGetter = this.featureLabelGetter;

        const newData = data.map((props) => {
            return new DatasetVectorFeature({
                ...props,
                color: colorGetter(props),
                label: labelGetter(props)
            });
        });
        if (append) {
            this.data_.push(...newData);
        } else {
            this.data_.replace(newData);
        }
    }

    protected afterInit_() {
        let runningGenerator: VectorDataGenerator | undefined;
        let runningDataPromise: Promise<DatasetVectorFeatureProps[]> | undefined;

        const onDataError = (error) => {
            runInAction(() => {
                this.data_.clear();
                this.mapLayer.loadingStatus.update({
                    value: LoadingState.Error,
                    message: error.message
                });
            });
        };

        const dataUpdaterDisposer = autorun(
            () => {
                this.mapLayer.loadingStatus.setValue(LoadingState.Loading);
                runInAction(() => {
                    this.data_.clear();
                });

                // cancel any running promise
                if (runningDataPromise) {
                    if (runningDataPromise.cancel) {
                        runningDataPromise.cancel();
                    } else {
                        runningDataPromise.isCanceled = true;
                    }
                    runningDataPromise = undefined;
                }

                // stop any running generator
                if (runningGenerator) {
                    runningGenerator.return();
                }
                const dataRequest = this.config.dataProvider(this);

                if (isDataGenerator(dataRequest)) {
                    // retrieve data in batches until the generator completes
                    let next = dataRequest.next();
                    const handleNextValue = (data: DatasetVectorFeatureProps<VectorFeatureProperties>[]) => {
                        this.setData_(data, true);
                        next = dataRequest.next();
                        if (!next.done) {
                            runningDataPromise = next.value;
                            next.value.then(handleNextValue).catch(onDataError);
                        } else {
                            runningDataPromise = undefined;
                            runningGenerator = undefined;
                            this.mapLayer.loadingStatus.setValue(LoadingState.Success);
                        }
                    };

                    if (!next.done) {
                        runningGenerator = dataRequest;
                        runningDataPromise = next.value;
                        next.value.then(handleNextValue).catch(onDataError);
                    }
                } else {
                    dataRequest
                        .then((data) => {
                            this.setData_(data);
                            this.mapLayer.loadingStatus.setValue(LoadingState.Success);
                        })
                        .catch(onDataError);
                }
            },
            {
                delay: 500
            }
        );

        const chromaScaleUpdateDisposer = reaction(
            () => this.colorMap?.colorScale,
            () => {
                this.updateChromaScale_();
            },
            {
                fireImmediately: true
            }
        );

        const featureColorUpdateDisposer = reaction(
            () => this.featureColorGetter,
            () => {
                this.updateFeatureColors_();
            },
            {
                delay: 100
            }
        );

        const featureLabelUpdateDisposer = reaction(
            () => this.labelProperties,
            () => {
                this.updateFeatureLabel_();
            },
            {
                fireImmediately: true
            }
        );

        const enumColorUpdateDisposer = reaction(
            () => this.discreteColorMap?.mapItems,
            () => {
                const enumProp = this.featureDescriptor?.properties.find(
                    (feature) => feature.id === this.colorProperty
                ) as EnumFeaturePropertyDescriptor;
                if (this.discreteColorMap) {
                    enumProp.options.forEach((option) => {
                        option.color = this.discreteColorMap!.mapItems[option.value];
                    });
                }
                this.updateFeatureColors_();
            }
        );

        // enable dataset widget visibility when a feature is selected (i.e. display feature information)
        const widgetVisibilityDisposer = autorun(() => {
            if (this.selectedFeatures.length) {
                this.setWidgetVisible(true);
            } else {
                this.setWidgetVisible(false);
            }
        });

        this.subscriptionTracker_.addSubscription(dataUpdaterDisposer);
        this.subscriptionTracker_.addSubscription(chromaScaleUpdateDisposer);
        this.subscriptionTracker_.addSubscription(featureColorUpdateDisposer);
        this.subscriptionTracker_.addSubscription(widgetVisibilityDisposer);
        this.subscriptionTracker_.addSubscription(enumColorUpdateDisposer);
        this.subscriptionTracker_.addSubscription(featureLabelUpdateDisposer);

        const featureDescriptor = this.config.featureDescriptor;
        if (typeof featureDescriptor === 'function') {
            const featureDescriptorUpdater = autorun(() => {
                featureDescriptor(this).then((featureDescriptor) => {
                    this.featureDescriptor = featureDescriptor;
                });

                this.subscriptionTracker_.addSubscription(featureDescriptorUpdater);
            });
        }
    }

    protected initMapLayer_(props) {
        return new FeatureLayer<DatasetVectorFeature>({
            id: `${this.id}_layer`,
            config: {
                geometryGetter: (feature) => feature.geometry,
                styleGetter: props.config.featureStyleFactory
                    ? props.config.featureStyleFactory(this.dataset.config.color)
                    : defaultVectoreFeatureStyleFactory(this.dataset.config.color)
            }
        });
    }
}
