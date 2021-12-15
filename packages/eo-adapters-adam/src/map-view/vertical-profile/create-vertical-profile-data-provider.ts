import debounce from 'lodash/debounce';

import { AxiosInstanceWithCancellation, DateRangeValue } from '@oidajs/core';
import { DatasetVerticalProfileViz, VerticalProfileItemProps, RasterBandModeSingle } from  '@oidajs/eo-mobx';

import { createGeoTiffLoader } from '../../utils';
import { AdamDatasetConfig, AdamDatasetSingleBandCoverage, isMultiBandCoverage } from '../../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../../get-adam-dataset-factory';
import { AdamWcsVerticalProfileDataProvider } from './adam-wcs-vertical-profile-data-provider';

export const createVerticalProfileDataProvider = (
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig,
    axiosInstance: AxiosInstanceWithCancellation
) => {

    let geotiffLoader = createGeoTiffLoader({
        axiosInstance,
        rotateImage: true
    });

    const variables: AdamDatasetSingleBandCoverage[] = [];

    if (!isMultiBandCoverage(datasetConfig.coverages)) {
        variables.push(...datasetConfig.coverages);
    }

    let wcsVerticalProfileProvider = new AdamWcsVerticalProfileDataProvider({
        serviceUrl: factoryConfig.wcsServiceUrl,
        axiosInstance: axiosInstance,
        variables: variables
    });

    // TODO: cesium wall textures don't follow coordinates ordering and we cannot predict
    // in which direction the texture will be applied. Use a custom primitive to specify
    // texture coordinates
    const swap = datasetConfig.id === 'earthcare_atlid';

    const debouncedProfileGetter = debounce((variable, timeFilter, resolve, reject) => {
        wcsVerticalProfileProvider.getProfiles({
            variable,
            timeFilter
        }).then((profiles) => {
            Promise.all(
                profiles.map(profile => {
                    return geotiffLoader.load({url: profile.dataUrl}, swap).then(imageData => {
                        let verticalProfile = {
                            id: profile.id,
                            geometry: {
                                bottomCoords: profile.track,
                                height: profile.metadata.VERTICAL_MAX,
                                minHeight: 0
                            },
                            style: {
                                fillImage: imageData as string
                            }
                        };
                        return verticalProfile;
                    });
                })
            ).then((profiles) => {
                resolve(profiles);
            }, (error) => {
                reject(error);
            });
        }, (error) => {
            reject(error);
        });
    }, 10);

    const load = (vProfileViz: DatasetVerticalProfileViz) => {
        const bandMode = vProfileViz.bandMode.value;
        if (bandMode instanceof RasterBandModeSingle) {
            let timeFilter = !datasetConfig.timeless ?  vProfileViz.dataset.toi : undefined;
            return new Promise<VerticalProfileItemProps[]>((resolve, reject) => {
                debouncedProfileGetter(bandMode.band, timeFilter, resolve, reject);
            });
        } else {
            return Promise.reject(new Error('Unsupported band mode'));
        }
    };

    const verticalProfileProvider = {
        getProfiles: load,
        getProfileData: (profileId: string) => {
            return wcsVerticalProfileProvider.getProfileDataUrl({
                profileId: profileId
            }).then((dataUrl) => {
                return geotiffLoader.load({url: dataUrl}, swap).then(imageData => {
                    return imageData as string;
                });
            });
        }
    };

    return {
        wcsProvider: wcsVerticalProfileProvider,
        verticalProfileProvider,
        geotiffLoader
    };
};
