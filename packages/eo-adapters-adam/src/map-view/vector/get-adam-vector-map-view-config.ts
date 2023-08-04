import {
    DatasetMapViewConfig,
    DatasetVectorMapVizConfig,
    VectorFeatureDescriptor,
    VectorFeaturePropertyDescriptor,
    VECTOR_VIZ_TYPE
} from '@oidajs/eo-mobx';
import { getPlottyColorScales } from '@oidajs/eo-geotiff';

import { createAdamVectorDataProvider } from './create-adam-vector-data-provider';
import { AdamVectorDatasetConfig } from '../../adam-dataset-config';
import { AdamOpenSearchClient } from '../../common/adam-opensearch-client';

export const getAdamVectorMapViewConfig = (datasetConfig: AdamVectorDatasetConfig, openSearchClient: AdamOpenSearchClient) => {
    const featureProperties = datasetConfig.featureProperties;

    const defaultAdamFeatureProperties: VectorFeaturePropertyDescriptor[] = [
        {
            id: 'datasetId',
            name: 'Dataset',
            type: 'string'
        },
        {
            id: 'subDatasetId',
            name: 'SubDataset',
            type: 'string'
        },
        {
            id: 'productDate',
            name: 'Product date',
            type: 'date'
        }
    ];

    // defined externally to make it always the last property
    const sourceProperty: VectorFeaturePropertyDescriptor = {
        id: 'source',
        name: 'Download URL',
        type: 'string',
        subType: 'url',
        isArray: true,
        parser: (value) => {
            if (value) {
                return value.split(',');
            } else {
                return [];
            }
        }
    };

    const vectorMapViewConfig: DatasetVectorMapVizConfig = {
        dataProvider: createAdamVectorDataProvider(datasetConfig, openSearchClient),
        colorScales: getPlottyColorScales(),
        dimensions: datasetConfig.dimensions,
        featureDescriptor: (vectorViz) => {
            const featureDescriptor: VectorFeatureDescriptor = {
                properties: defaultAdamFeatureProperties.slice()
            };

            if (Array.isArray(featureProperties)) {
                // feature properties are common to all subdatasets
                featureDescriptor.properties.push(...featureProperties);
            } else if (featureProperties) {
                // subdataset specific feature properties
                const subdataset = vectorViz.dimensions.values.get('subdataset');
                if (typeof subdataset === 'string') {
                    const subdatasetProperties = featureProperties[subdataset];
                    if (subdatasetProperties) {
                        featureDescriptor.properties.push(...subdatasetProperties);
                    }
                }
            }

            //add the download link as last property
            featureDescriptor.properties.push(sourceProperty);

            return Promise.resolve(featureDescriptor);
        }
    };
    return {
        type: VECTOR_VIZ_TYPE,
        config: vectorMapViewConfig
    } as DatasetMapViewConfig<typeof VECTOR_VIZ_TYPE>;
};
