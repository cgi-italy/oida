import { FeatureLike } from 'ol/Feature';

import { IFeature } from '@oidajs/core';

import { OLFeatureLayer } from '../layers';

/**
 * Get the data associated to a map feature. In case the feature is a cluster
 * returns the data for all the features in the cluster.
 * @param mapFeature the input map feature
 * @returns an array containing the feature data.
 * Empty array means no data. Length one array means single map feature.
 * Length > 1 array means feature cluster (data for all the features in the cluster)
 */
export const getFeaturesData = <T = any>(mapFeature: FeatureLike): IFeature<T>[] => {
    const featureId = mapFeature.getId();
    const featureData = mapFeature.get(OLFeatureLayer.FEATURE_DATA_KEY);
    if (typeof featureId === 'string' && featureData) {
        // single feature
        return [
            {
                id: featureId,
                data: featureData
            }
        ];
    } else {
        // check for feature cluster
        const clusterFeatures = mapFeature.get('features');
        if (Array.isArray(clusterFeatures)) {
            return clusterFeatures.map((feature) => {
                return {
                    id: feature.getId(),
                    data: feature.get(OLFeatureLayer.FEATURE_DATA_KEY)
                };
            });
        } else {
            return [];
        }
    }
};
