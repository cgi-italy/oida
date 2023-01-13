import { SubscriptionTracker } from '@oidajs/core';
import { action, IKeyValueMap, makeObservable, observable, ObservableMap, reaction, runInAction } from 'mobx';

import { Dataset } from './dataset';
import { TimeSearchDirection } from './dataset-time-distribution-provider';
import {
    DataDomainProviderFilters,
    DatasetDimension,
    DomainRange,
    isDomainProvider,
    isValueDomain,
    ValueDomain,
    CategoricalDomain
} from './dataset-variable';

export type ValueDimensionValueType = Date | number;
export type CategoricalDimensionValueType = ValueDimensionValueType | string;
export type DimensionDomainType = ValueDomain<number> | ValueDomain<Date, number> | CategoricalDomain<CategoricalDimensionValueType>;
export type DimensionRangeType = DomainRange<ValueDimensionValueType> | CategoricalDimensionValueType[];

export type DatasetDimensionsProps = {
    /** The dataset object */
    dataset: Dataset;
    /** The dataset dimensions configuration */
    dimensions?: DatasetDimension<DimensionDomainType>[];
    /** The initial dimension values */
    dimensionValues?:
        | Record<string, CategoricalDimensionValueType>
        | Map<string, CategoricalDimensionValueType>
        | Array<[string, string | number]>;

    rangeValues?:
        | IKeyValueMap<DimensionRangeType>
        | Map<string, DimensionRangeType>
        | Array<[string, Array<string | number> | ValueDomain<string | number>]>;
    /**
     * An optional getter to retrieve the currently selected dataset variable.
     * Should be specified if any of the dimension domain depends on the selected dataset variable
     */
    currentVariable?: () => string | undefined;
    /** If set all dimension with a domain defined will be initialize to the domain first valid value */
    initDimensions?: boolean;
};

export class DatasetDimensions implements DataDomainProviderFilters {
    readonly values: ObservableMap<string, CategoricalDimensionValueType>;
    readonly ranges: ObservableMap<string, DimensionRangeType>;
    readonly domains: ObservableMap<string, DimensionDomainType | undefined>;
    readonly domainRequests: ObservableMap<string, Promise<DimensionDomainType | undefined>>;

    protected readonly variableGetter_: (() => string | undefined) | undefined;
    protected readonly dataset_: Dataset;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: DatasetDimensionsProps) {
        this.dataset_ = props.dataset;

        this.variableGetter_ = props.currentVariable;

        if (Array.isArray(props.dimensionValues) || Array.isArray(props.rangeValues)) {
            this.values = observable.map(
                {},
                {
                    deep: false
                }
            );
            this.ranges = observable.map(
                {},
                {
                    deep: false
                }
            );
            this.applySnapshot(props);
        } else {
            this.values = observable.map(props.dimensionValues, {
                deep: false
            });
            this.ranges = observable.map(props.rangeValues, {
                deep: false
            });
        }

        this.domains = observable.map(
            {},
            {
                deep: false
            }
        );
        this.domainRequests = observable.map(
            {},
            {
                deep: false
            }
        );

        this.subscriptionTracker_ = new SubscriptionTracker();
        makeObservable(this);

        this.afterInit_(props.dimensions || [], props.initDimensions);
    }

    get aoi() {
        return this.dataset_.aoi;
    }

    get toi() {
        return this.dataset_.toi;
    }

    get variable() {
        return this.variableGetter_ ? this.variableGetter_() : undefined;
    }

    get dimensionValues() {
        return this.values;
    }

    get additionalFilters() {
        return this.dataset_.additionalFilters.items;
    }

    @action
    setValue(dimension: string, value: CategoricalDimensionValueType) {
        if (this.ranges.has(dimension)) {
            this.ranges.delete(dimension);
        }
        this.values.set(dimension, value);
    }

    @action
    unsetValue(dimension: string) {
        this.values.delete(dimension);
    }

    @action
    setRange(dimension: string, range?: DimensionRangeType) {
        const currentValue = this.ranges.get(dimension);
        if (currentValue && range) {
            // deep equality check
            if (!Array.isArray(currentValue) && !Array.isArray(range)) {
                if (currentValue.min === range.min && currentValue.max === range.max) {
                    return;
                }
            } else if (Array.isArray(currentValue) && Array.isArray(range)) {
                if (
                    range.length === currentValue.length &&
                    range.every((value, idx) => {
                        return value === currentValue[idx];
                    })
                ) {
                    return;
                }
            }
        }
        if (this.values.has(dimension)) {
            this.values.delete(dimension);
        }
        this.getDomainClampedRange_(dimension, range).then((clampedRange) => {
            if (clampedRange) {
                runInAction(() => {
                    this.ranges.set(dimension, clampedRange);
                });
            } else {
                this.unsetRange(dimension);
            }
        });
    }

    @action
    unsetRange(dimension: string) {
        this.ranges.delete(dimension);
    }

    getDimensionDomain<T extends DimensionDomainType = DimensionDomainType>(dimension: string) {
        return this.domains.get(dimension) as T | undefined;
    }

    getSnapshot() {
        return {
            dimensionValues: this.values.toJSON().map(([key, value]) => {
                if (value instanceof Date) {
                    return [key, value.toISOString()];
                } else {
                    return [key, value];
                }
            }),
            rangeValues: this.ranges.toJSON().map(([key, range]) => {
                if (key === 'time') {
                    if (Array.isArray(range)) {
                        return [key, range.map((value) => (value as Date).toISOString())];
                    } else {
                        return [
                            key,
                            {
                                min: (range.min as Date).toISOString(),
                                max: (range.max as Date).toISOString()
                            }
                        ];
                    }
                } else {
                    return [key, range];
                }
            })
        };
    }

    applySnapshot(snapshot) {
        // TODO: currently there is not a way to extract the dimension value type from its config
        // we should probably add a property to DatasetDimension (e.g. dataType). For the time
        // being we check only for dimension with id equal to 'time' and convert string values to dates
        this.values.replace(
            snapshot.dimensionValues.map(([key, value]) => {
                if (key === 'time') {
                    return [key, new Date(value)];
                } else {
                    return [key, value];
                }
            })
        );
        this.ranges.replace(
            snapshot.rangeValues.map(([key, range]) => {
                if (key === 'time') {
                    if (Array.isArray(range)) {
                        return [key, range.map((value) => new Date(value))];
                    } else {
                        return [key, { min: new Date(range.min), max: new Date(range.max) }];
                    }
                } else {
                    return [key, range];
                }
            })
        );
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
    }

    protected afterInit_(dimensions: DatasetDimension<DimensionDomainType>[], initDimensions?: boolean) {
        dimensions.forEach((dimension) => {
            const domainConfig = dimension.domain;
            if (domainConfig && isDomainProvider(domainConfig)) {
                const domainSubscriptionDisposer = reaction(
                    () => domainConfig(this),
                    (domainRequest) => {
                        const currentRequest = this.domainRequests.get(dimension.id);
                        if (currentRequest && currentRequest.cancel) {
                            currentRequest.cancel();
                        }
                        this.domainRequests.set(
                            dimension.id,
                            domainRequest.then((domain) => {
                                this.setDomain_(dimension.id, domain);
                                this.checkDimensionValue_(dimension.id, initDimensions);
                                return domain;
                            })
                        );
                    },
                    {
                        fireImmediately: true
                    }
                );

                this.subscriptionTracker_.addSubscription(domainSubscriptionDisposer);
            } else {
                this.domains.set(dimension.id, domainConfig);
                this.checkDimensionValue_(dimension.id, initDimensions);
            }
        });
    }

    @action
    protected setDomain_(dimensionId: string, domain: DimensionDomainType) {
        this.domains.set(dimensionId, domain);
    }

    protected checkDimensionValue_(dimension: string, initWhenUndefined?: boolean) {
        const domain = this.domains.get(dimension);
        const currentValue = this.values.get(dimension);
        if (currentValue !== undefined) {
            if (domain) {
                if (isValueDomain(domain)) {
                    if (domain.min !== undefined && currentValue < domain.min) {
                        setTimeout(() => this.setValue(dimension, domain.min!), 0);
                    }
                    if (domain.max !== undefined && currentValue > domain.max) {
                        setTimeout(() => this.setValue(dimension, domain.max!), 0);
                    }
                } else {
                    if (!domain.values.find((item) => item.value === currentValue)) {
                        setTimeout(() => {
                            if (domain.values.length) {
                                this.setValue(dimension, domain.values[0].value);
                            } else {
                                this.unsetValue(dimension);
                            }
                        }, 0);
                    }
                }
            }
        } else if (initWhenUndefined) {
            this.initDimensionValue_(dimension);
        }
    }

    protected initDimensionValue_(dimension: string) {
        const currentValue = this.values.get(dimension);

        if (currentValue === undefined && !this.ranges.has(dimension)) {
            const domain = this.domains.get(dimension);

            if (dimension === 'time') {
                this.initTimeDimensionValue_();
            } else {
                if (domain) {
                    if (isValueDomain(domain)) {
                        if (domain.min !== undefined) {
                            this.setValue(dimension, domain.min);
                        }
                    } else {
                        if (domain.values.length) {
                            this.setValue(dimension, domain.values[0].value);
                        }
                    }
                }
            }
        }
    }

    protected initTimeDimensionValue_() {
        const domain = this.domains.get('time');
        // initialize the time dimension value to the current dataset selected time
        const datasetTime = this.dataset_.toi;
        if (datasetTime) {
            if (datasetTime instanceof Date) {
                this.setValue('time', datasetTime);
            } else {
                //a time range is currently selected. try to find the time nearest to the range end time
                const timeProvider = this.dataset_.config.timeDistribution?.provider;
                if (timeProvider) {
                    timeProvider.getNearestItem(datasetTime.end, TimeSearchDirection.Backward, this).then((dt) => {
                        if (dt) {
                            this.setValue('time', dt.start);
                        }
                    });
                } else {
                    this.setValue('time', datasetTime.end);
                }
            }
        } else if (domain) {
            if (isValueDomain(domain)) {
                if (domain.min !== undefined) {
                    this.setValue('time', domain.min);
                }
            } else {
                if (domain.values.length) {
                    this.setValue('time', domain.values[0].value);
                }
            }
        }
    }

    protected getDomainClampedRange_(dimension: string, range?: DimensionRangeType): Promise<DimensionRangeType | undefined> {
        let domainPromise = this.domainRequests.get(dimension);
        if (!domainPromise) {
            const domain = this.domains.get(dimension);
            if (domain) {
                domainPromise = Promise.resolve(domain);
            }
        }
        if (domainPromise) {
            return domainPromise
                .then((domain) => {
                    if (domain && isValueDomain(domain) && domain.min !== undefined && domain.max !== undefined) {
                        // if no range is defined or the current range is outside of the domain extent set the range to the domain extent
                        if (!range || Array.isArray(range) || range.min >= domain.max || range.max <= domain.min) {
                            return {
                                min: domain.min,
                                max: domain.max
                            };
                        } else {
                            // clamp the range to the domain extent
                            let min = range.min;
                            let max = range.max;
                            if (min < domain.min) {
                                min = domain.min;
                            }
                            if (max > domain.max) {
                                max = domain.max;
                            }
                            return {
                                min: min,
                                max: max
                            };
                        }
                    } else {
                        return range;
                    }
                })
                .catch(() => {
                    return range;
                });
        } else {
            return Promise.resolve(range);
        }
    }
}

export interface HasDatasetDimensions {
    dimensions: DatasetDimensions;
}

export function hasDatasetDimensions(object: any): object is HasDatasetDimensions {
    return !!object && object.dimensions instanceof DatasetDimensions;
}
