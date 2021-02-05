import { QueryParams, SortOrder, randomColorFactory } from '@oida/core';
import { AdamDatasetConfig, isMultiBandCoverage, AdamDatasetRenderMode } from '../adam-dataset-config';
import { AdamWcsCoverageDescriptionClient, AdamWcCoverageDescriptionClientConfig } from './adam-wcs-coverage-description-client';

export type AdamFeaturedDataset = Omit<AdamDatasetConfig, 'coverageSrs' | 'srsDef' | 'coverageExtent' | 'renderMode' | 'fixedTime' | 'productSearchRecordContent' | 'color'> & {
    fixedTime?: string;
    color?: string;
    description?: string;
};

export type AdamFeaturedDatasetDiscoveryResponse = {
    total: number;
    datasets: AdamFeaturedDataset[];
};

export type AdamFeaturedDatasetClientConfig = {
    datasets: AdamFeaturedDataset[];
    wcs: AdamWcCoverageDescriptionClientConfig;
};

export class AdamFeaturedDatasetDiscoveryClient {

    protected datasets_: AdamFeaturedDataset[];
    protected wcsCoverageDescriptionClient_: AdamWcsCoverageDescriptionClient;
    protected readonly colorFactory_: () => string;

    constructor(config: AdamFeaturedDatasetClientConfig) {
        this.datasets_ = config.datasets;
        this.wcsCoverageDescriptionClient_ = new AdamWcsCoverageDescriptionClient(config.wcs);
        this.colorFactory_ = randomColorFactory();
    }

    searchDatasets(queryParams: QueryParams): Promise<AdamFeaturedDatasetDiscoveryResponse> {

        let datasets = this.datasets_.slice();

        if (queryParams.filters) {
            queryParams.filters.forEach((filter) => {
                if (filter.key === 'q') {
                    datasets = datasets.filter((dataset) => {
                        return dataset.name.toLowerCase().indexOf(filter.value.toLowerCase()) !== -1;
                    });
                }
            });
        }
        if (queryParams.sortBy) {
            if (queryParams.sortBy.key === 'name') {
                datasets = datasets.sort((d1, d2) => {
                    if (d1.name > d2.name) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
            }

            if (queryParams.sortBy.order !== SortOrder.Ascending) {
                datasets = datasets.reverse();
            }
        }

        if (queryParams.paging) {
            datasets = datasets.slice(queryParams.paging.offset, queryParams.paging.offset + queryParams.paging.pageSize);
        }

        return Promise.resolve({
            datasets: datasets,
            total: this.datasets_.length
        });
    }

    getAdamDatasetConfig(config: AdamFeaturedDataset): Promise<AdamDatasetConfig> {
        let coverageId: string;
        if (isMultiBandCoverage(config.coverages)) {
            coverageId = config.coverages.wcsCoverage;
        } else {
            coverageId = config.coverages[0].wcsCoverage;
        }
        return this.wcsCoverageDescriptionClient_.getCoverageDetails(coverageId).then((coverage) => {
            return {
                ...config,
                coverageExtent: coverage.extent,
                coverageSrs: coverage.srs,
                srsDef: coverage.srsDef,
                renderMode: AdamDatasetRenderMode.ClientSide,
                color: config.color || this.colorFactory_(),
                fixedTime: coverage.time.start.getTime() === coverage.time.end.getTime() ? coverage.time.start : undefined
            };
        });
    }
}
