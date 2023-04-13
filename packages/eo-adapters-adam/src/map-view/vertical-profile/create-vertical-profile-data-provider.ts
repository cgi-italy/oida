import debounce from 'lodash/debounce';

import { AxiosInstanceWithCancellation, cartesianProduct, formatDate } from '@oidajs/core';
import { DatasetVerticalProfileViz, VerticalProfileItemProps, RasterBandModeSingle } from '@oidajs/eo-mobx';

import { createGeoTiffLoader, getCoverageWcsParams } from '../../utils';
import { AdamDatasetDimension, AdamWcsDatasetConfig } from '../../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../../get-adam-dataset-factory';
import { AdamWcsVerticalProfileDataProvider, AdamWcsVerticalProfilesRequest } from './adam-wcs-vertical-profile-data-provider';

export const createVerticalProfileDataProvider = (
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamWcsDatasetConfig,
    axiosInstance: AxiosInstanceWithCancellation
) => {
    const geotiffLoader = createGeoTiffLoader({
        axiosInstance,
        rotateImage: true
    });

    const wcsVerticalProfileProvider = new AdamWcsVerticalProfileDataProvider({
        serviceUrl: factoryConfig.wcsServiceUrl,
        axiosInstance: axiosInstance
    });

    const dimensionsSubsetMap =
        datasetConfig.dimensions?.reduce((dimensionMap, dimension) => {
            return {
                ...dimensionMap,
                [dimension.wcsSubset.id]: dimension
            };
        }, {} as Record<string, AdamDatasetDimension>) || {};

    const profileMapper = (profile) => {
        return geotiffLoader.load({ url: profile.dataUrl }).then((imageData) => {
            let profileName = `Time ${formatDate(profile.time, {
                format: 'YYYY-MM-DD HH:mm:ss'
            })}`;

            profile.dimensionSubsets?.forEach((subset: string) => {
                const matches = subset.match(/([^(]*)\(([^)]*)\)/);
                if (matches) {
                    const [, id, value] = matches;
                    const dimensionConfig = dimensionsSubsetMap[id];
                    if (dimensionConfig) {
                        profileName += `, ${dimensionConfig.name} ${value}`;
                    }
                }
            });

            const verticalProfile = {
                id: profile.id,
                name: profileName,
                geometry: {
                    bottomCoords: profile.track,
                    height: profile.metadata.VERTICAL_MAX,
                    minHeight: 0
                },
                style: {
                    fillImage: imageData
                }
            };
            return verticalProfile;
        });
    };

    const debouncedProfileGetter = debounce(
        (
            request: AdamWcsVerticalProfilesRequest & {
                sequentialSubsets: string[];
            },
            resolve,
            reject
        ) => {
            const { sequentialSubsets, ...profileRequest } = request;
            if (!sequentialSubsets.length) {
                return wcsVerticalProfileProvider.getProfiles(profileRequest).then(
                    (profiles) => {
                        Promise.all(profiles.map(profileMapper)).then(
                            (profiles) => {
                                resolve(profiles);
                            },
                            (error) => {
                                reject(error);
                            }
                        );
                    },
                    (error) => {
                        reject(error);
                    }
                );
            } else {
                const requests = sequentialSubsets.map((sequentialSubset) => {
                    return wcsVerticalProfileProvider
                        .getProfiles({
                            ...profileRequest,
                            dimensionSubsets: [...(profileRequest.dimensionSubsets || []), sequentialSubset]
                        })
                        .then((profiles) => {
                            return Promise.all(profiles.map(profileMapper)).then((profiles) => {
                                return profiles;
                            });
                        });
                });

                Promise.all(requests)
                    .then((profiles) => {
                        resolve(profiles[0].concat(...profiles.slice(1)));
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        },
        10
    );

    const load = (vProfileViz: DatasetVerticalProfileViz) => {
        const subsets: string[] = [];
        const bandMode = vProfileViz.bandMode;
        if (!(bandMode.value instanceof RasterBandModeSingle)) {
            return Promise.reject(new Error('Unsupported band mode'));
        }
        const wcsCoverageParams = getCoverageWcsParams(datasetConfig, vProfileViz.dimensions, bandMode);
        if (!wcsCoverageParams) {
            return Promise.reject(new Error('Unsupported coverage'));
        }
        if (wcsCoverageParams.bandSubset) {
            subsets.push(wcsCoverageParams.bandSubset);
        }
        subsets.push(...wcsCoverageParams.dimensionSubsets);

        const timeFilter = datasetConfig.fixedTime instanceof Date ? datasetConfig.fixedTime : vProfileViz.dataset.toi;
        if (!timeFilter) {
            return Promise.reject(new Error('No time selected'));
        }

        let emptyDimension: string | undefined;
        const categoricalRanges = Object.entries(wcsCoverageParams.categoricalDimensionRanges).map(([dimension, values]) => {
            if (!values.length) {
                emptyDimension = dimension;
            }
            return values.map((value) => {
                return `${dimension}(${value})`;
            });
        });

        if (emptyDimension) {
            const emptyDimensionName = dimensionsSubsetMap[emptyDimension]?.name;
            return Promise.reject(new Error(`No ${(emptyDimensionName || emptyDimension).toLowerCase()} value selected`));
        }

        //compute the cartesian product of all categorical ranges to create a sequence of requests
        const sequentialSubsets = categoricalRanges.length
            ? cartesianProduct(...categoricalRanges).map((item) => {
                  return item.join(',');
              })
            : [];

        return new Promise<VerticalProfileItemProps[]>((resolve, reject) => {
            debouncedProfileGetter(
                {
                    wcsCoverage: wcsCoverageParams.coverageId,
                    timeFilter: timeFilter,
                    dimensionSubsets: subsets,
                    geometryOffset: datasetConfig.requestExtentOffset,
                    sequentialSubsets: sequentialSubsets
                },
                resolve,
                reject
            );
        });
    };

    const verticalProfileProvider = {
        getProfiles: load,
        getProfileData: (profileId: string) => {
            return wcsVerticalProfileProvider
                .getProfileDataUrl({
                    profileId: profileId
                })
                .then((dataUrl) => {
                    return geotiffLoader.load({ url: dataUrl }).then((imageData) => {
                        return imageData;
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
