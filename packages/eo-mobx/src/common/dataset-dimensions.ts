import { SubscriptionTracker } from '@oida/core';
import { action, autorun, makeObservable, observable, ObservableMap, reaction } from 'mobx';

import { Dataset } from './dataset';
import { DataDomain, DataDomainProviderFilters, DatasetDimension, isDomainProvider, isValueDomain } from './dataset-variable';

type DimensionValueType = string | number | Date;

export type DatasetDimensionsProps = {
    /** The dataset object */
    dataset: Dataset;
    /** The dataset dimensions configuration */
    dimensions?: DatasetDimension<DataDomain<DimensionValueType>>[];
    /** The initial dimension values */
    dimensionValues?: Record<string, DimensionValueType> | Map<string, DimensionValueType>;
    /**
     * An optional getter to retrieve the currently selected dataset variable.
     * Should be specified if any of the dimension domain depends on the selected dataset variable
     */
    currentVariable?: () => (string | undefined);
    /** If set all dimension with a domain defined will be initialize to the domain first valid value */
    initDimensions?: boolean;
};

export class DatasetDimensions implements DataDomainProviderFilters {
    readonly values: ObservableMap<string, DimensionValueType> = observable.map<string, DimensionValueType>({}, {
        deep: false
    });
    readonly domains = observable.map<string, DataDomain<DimensionValueType> | undefined>({}, {
        deep: false
    });
    readonly domainRequests = observable.map<string, Promise<DataDomain<DimensionValueType> | undefined>>({}, {
        deep: false
    });

    protected readonly variableGetter_: (() => (string | undefined)) | undefined;
    protected readonly dataset_: Dataset;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: DatasetDimensionsProps) {

        this.dataset_ = props.dataset;

        this.variableGetter_ = props.currentVariable;
        this.values = observable.map<string, DimensionValueType>(props.dimensionValues, {
            deep: false
        });

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
    setValue(dimension: string, value: DimensionValueType) {
        this.values.set(dimension, value);
    }

    @action
    unsetValue(dimension: string) {
        this.values.delete(dimension);
    }

    getDimensionDomain<T extends DataDomain<DimensionValueType> = DataDomain<DimensionValueType>>(dimension: string) {
        return this.domains.get(dimension) as T | undefined;
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
    }

    protected afterInit_(dimensions: DatasetDimension<DataDomain<DimensionValueType>>[], initDimensions?: boolean) {
        dimensions.forEach((dimension) => {
            const domainConfig = dimension.domain;
            if (domainConfig && isDomainProvider(domainConfig)) {
                const domainSubscriptionDisposer = reaction(() => domainConfig(this), (domainRequest) => {
                    const currentRequest = this.domainRequests.get(dimension.id);
                    if (currentRequest && currentRequest.cancel) {
                        currentRequest.cancel();
                    }
                    this.domainRequests.set(dimension.id, domainRequest.then((domain) => {
                        //this.domains.set(dimension.id, domain);
                        this.setDomain_(dimension.id, domain);
                        this.checkDimensionValue_(dimension.id, initDimensions);
                        return domain;
                    }));
                }, {
                    fireImmediately: true
                });

                this.subscriptionTracker_.addSubscription(domainSubscriptionDisposer);
            } else {
                this.domains.set(dimension.id, domainConfig);
                this.checkDimensionValue_(dimension.id, initDimensions);
            }
        });
    }

    @action
    protected setDomain_(dimensionId: string, domain: DataDomain<DimensionValueType>) {
        this.domains.set(dimensionId, domain);
    }

    protected checkDimensionValue_(dimension: string, initWhenUndefined?: boolean) {
        const domain = this.domains.get(dimension);
        const currentValue = this.values.get(dimension);
        if (currentValue !== undefined) {
            if (domain) {
                if (isValueDomain(domain)) {
                    if (domain.min !== undefined && currentValue < domain.min) {
                        setImmediate(() => this.setValue(dimension, domain.min!));
                    }
                    if (domain.max !== undefined && currentValue > domain.max) {
                        setImmediate(() => this.setValue(dimension, domain.max!));
                    }
                } else {
                    if (!domain.values.find((item) => item.value === currentValue)) {
                        setImmediate(() => {
                            if (domain.values.length) {
                                this.setValue(dimension, domain.values[0].value);
                            } else {
                                this.unsetValue(dimension);
                            }
                        });
                    }
                }
            }
        } else if (initWhenUndefined) {
            this.initDimensionValue_(dimension);
        }
    }

    protected initDimensionValue_(dimension: string) {

        const currentValue = this.values.get(dimension);

        if (currentValue === undefined) {
            const domain = this.domains.get(dimension);

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

export interface HasDatasetDimensions {
    dimensions: DatasetDimensions;
}

export function hasDatasetDimensions(object: any): object is HasDatasetDimensions {
    return !!object && object.dimensions instanceof DatasetDimensions;
}

