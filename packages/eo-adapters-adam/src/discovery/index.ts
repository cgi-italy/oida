import { DatasetDiscoveryProvider } from '@oidajs/eo-mobx';

import {
    ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE,
    AdamOpensearchDatasetDiscoveryProvider,
    AdamOpensearchDatasetDiscoveryProviderProps
} from './adam-opensearch-dataset-discovery-provider';

import {
    ADAM_FEATURED_DATASET_DISCOVERY_PROVIDER_TYPE,
    AdamFeaturedDatasetDiscoveryProvider,
    AdamFeaturedDatasetDiscoveryProviderProps
} from './adam-featured-dataset-discovery-provider';
import {
    ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE_V2,
    AdamOpensearchDatasetDiscoveryProviderPropsV2,
    AdamOpensearchDatasetDiscoveryProviderV2
} from './adam-opensearch-dataset-discovery-provider-v2';

declare module '@oidajs/eo-mobx' {
    interface DatasetDiscoveryProviderDefinitions {
        [ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE]: AdamOpensearchDatasetDiscoveryProviderProps;
        [ADAM_FEATURED_DATASET_DISCOVERY_PROVIDER_TYPE]: AdamFeaturedDatasetDiscoveryProviderProps;
        [ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE_V2]: AdamOpensearchDatasetDiscoveryProviderPropsV2;
    }

    interface DatasetDiscoveryProviderTypes {
        [ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE]: AdamOpensearchDatasetDiscoveryProvider;
        [ADAM_FEATURED_DATASET_DISCOVERY_PROVIDER_TYPE]: AdamFeaturedDatasetDiscoveryProvider;
        [ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE_V2]: AdamOpensearchDatasetDiscoveryProviderV2;
    }
}

DatasetDiscoveryProvider.register(ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE, AdamOpensearchDatasetDiscoveryProvider);
DatasetDiscoveryProvider.register(ADAM_FEATURED_DATASET_DISCOVERY_PROVIDER_TYPE, AdamFeaturedDatasetDiscoveryProvider);
DatasetDiscoveryProvider.register(ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE_V2, AdamOpensearchDatasetDiscoveryProviderV2);

export * from './adam-wcs-coverage-description-client';
export * from './adam-featured-dataset-discovery-client';
export * from './adam-featured-dataset-discovery-provider';
export * from './adam-opensearch-dataset-discovery-provider';
export * from './adam-opensearch-dataset-discovery-client';
export * from './adam-opensearch-dataset-discovery-provider-v2';
export * from './adam-opensearch-dataset-discovery-client-v2';
