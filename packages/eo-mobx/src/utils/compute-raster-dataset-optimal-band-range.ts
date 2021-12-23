import { DataDomainProvider, DataDomainProviderFilters, isValueDomain, NumericalValueDomain, NumericDomain } from '../common';

const getDomainStretchMinMax = (domain: NumericalValueDomain) => {
    let min: number | undefined;
    let max: number | undefined;
    if (domain.percentiles) {
        const first = domain.percentiles.find((percentile) => percentile[0] === 1);
        if (first) {
            min = first[1];
        }

        const ninetynineth = domain.percentiles.find((percentile) => percentile[0] === 99);
        if (ninetynineth) {
            max = ninetynineth[1];
        }
    }
    if (min === undefined) {
        min = domain.min;
    }
    if (max === undefined) {
        max = domain.max;
    }

    if (min !== undefined && max !== undefined) {
        return {
            min: min,
            max: max
        };
    } else {
        return undefined;
    }
};

export type RasterDatasetOptimalBandRangeParams = {
    filters: Omit<DataDomainProviderFilters, 'variable'>;
    bandDomainProviders: DataDomainProvider<NumericDomain>[];
};

/**
 * Return the optimal range for a set of bands given a set of filters
 *
 * @param params the input parameters
 * @returns a promise resolving to the optimal range
 */
export const computeRasterDatasetOptimalBandRange = (params: RasterDatasetOptimalBandRangeParams) => {
    return Promise.all(params.bandDomainProviders.map((provider) => provider(params.filters))).then((domains) => {
        const numericalDomains: NumericalValueDomain[] = domains.filter((domain) => isValueDomain(domain)) as NumericalValueDomain[];

        let dataRange: { min: number; max: number } | undefined;

        numericalDomains.forEach((domain) => {
            const domainRange = getDomainStretchMinMax(domain);
            if (domainRange) {
                dataRange = dataRange
                    ? {
                          min: Math.min(dataRange.min, domainRange.min),
                          max: Math.max(dataRange.max, domainRange.max)
                      }
                    : domainRange;
            }
        });

        return dataRange;
    });
};
