import { FormatterQuantity } from '@oida/core';
import { isValueDomain, NumericalValueDomain, NumericDomain } from './dataset-variable';

export type NumericDomainMapperConfig = {
    domain: NumericDomain | undefined,
    unitsSymbol?: string,
};

export class NumericDomainMapper {

    protected static normalizeDomainValue_(domain: NumericalValueDomain, value: number) {

        if (value === domain.noData || (domain.reservedValues && domain.reservedValues[value] !== undefined)) {
            return undefined;
        }
        return value * (domain.scale || 1) + (domain.offset || 0);
    }

    protected static denormalizeDomainValue_(domain: NumericalValueDomain, value: number) {
        return (value - (domain.offset || 0)) / (domain.scale || 1);
    }

    readonly unitsSymbol: string | undefined;

    protected domain_: NumericDomain | undefined;
    protected normalizeValueImpl_: ((value: number) => number | undefined);
    protected denormalizeValueImpl_: ((value: number) => number);
    protected domainValuesDict_: Record<number, string> | undefined;

    constructor(config: NumericDomainMapperConfig) {
        this.domain_ = config.domain;
        this.unitsSymbol = config.unitsSymbol;

        if (this.domain_ && isValueDomain(this.domain_)) {
            this.normalizeValueImpl_ = NumericDomainMapper.normalizeDomainValue_.bind(this, this.domain_);
            this.denormalizeValueImpl_ = NumericDomainMapper.denormalizeDomainValue_.bind(this, this.domain_);
            this.domainValuesDict_ = this.domain_.reservedValues;
        } else {
            this.normalizeValueImpl_ = (value) => value;
            this.denormalizeValueImpl_ = (value) => value;
            this.domainValuesDict_ = this.domain_?.values.reduce((valuesDict, value) => {
                return {
                    ...valuesDict,
                    [value.value]: value.label || value.value.toString()
                };
            }, {});
        }
    }

    get domainScalingFactor() {
        if (this.domain_ && isValueDomain(this.domain_)) {
            return this.domain_.scale || 1.0;
        } else {
            return 1.0;
        }
    }

    get domainOffset() {
        if (this.domain_ && isValueDomain(this.domain_)) {
            return this.domain_.offset || 0;
        } else {
            return 0;
        }
    }

    normalizeValue(value: number) {
        return this.normalizeValueImpl_(value);
    }

    denormalizeValue(value: number) {
        return this.denormalizeValueImpl_(value);
    }

    formatValue(value: number, options?: Omit<NumericDomainValueFormatterOptions, 'domain'>) {
        if (this.domainValuesDict_ && this.domainValuesDict_[value]) {
            return this.domainValuesDict_[value];
        } else {
            let formattedValue: string | number | undefined = this.normalizeValue(value);
            if (formattedValue !== undefined) {
                if (options?.precision) {
                    formattedValue = formattedValue.toFixed(options.precision);
                }
                if (this.unitsSymbol && options?.appendUnits) {
                    formattedValue = `${formattedValue} ${this.unitsSymbol}`;
                }
                return formattedValue as string;
            } else {
                return 'N/A';
            }
        }
    }

}

export type NumericDomainValueFormatterOptions = {
    domain: NumericDomainMapper,
    precision?: number,
    appendUnits?: boolean
};


export const NumericDomainValueQuantity: FormatterQuantity<number, NumericDomainValueFormatterOptions> = {
    id: 'numeric_domain_value'
};


export const formatDomainValue = (
    value: number,
    options: NumericDomainValueFormatterOptions
)  => {

    let formattedValue: string | number | undefined;

    if (typeof value !== 'number') {
        formattedValue = undefined;
    } else {
        formattedValue = options.domain.formatValue(value, options);
    }
    return formattedValue;
};

