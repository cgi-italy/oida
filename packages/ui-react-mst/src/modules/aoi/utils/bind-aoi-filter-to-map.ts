import { autorun, reaction } from 'mobx';
import debounce from 'lodash/debounce';

import { AoiValue, AOI_FIELD_ID } from '@oida/core';
import { IDataFilters, IMap } from '@oida/state-mst';

import { IAOICollection, IAOI } from '../types';

export type bindAoiFilterToMapProps = {
    filters: IDataFilters;
    aoiFieldKey: string;
    aois: IAOICollection;
    map: IMap;
    viewportChangeDebounce?: number;
};

let nextAoiId = 1;

/**
 * Automatically create an AOI instance based on the value of an AOI filter (e.g. for map displaying).
 * Bind filter geometry value to current map viewport when fromViewport property is set on the Aoi filter Value.
 * @returns disposer function, which can be used to stop tracking the filter value and remove any created AOI instance/viewport observer.
 */
export const bindAoiFilterToMap = (props: bindAoiFilterToMapProps) => {

    let aoiInstance: IAOI | undefined;
    let viewportObserverDisposer: (() => void) | undefined;

    const debouncedAoiUpdate = debounce((aoiValue: AoiValue) => {
        props.filters.set(props.aoiFieldKey, aoiValue, AOI_FIELD_ID);
    }, props.viewportChangeDebounce || 1000);


    let filterObserverDisposer = reaction(() => props.filters.get(props.aoiFieldKey), (value: AoiValue | undefined) => {

        let valueProps = value ? value.props || {} : {};

        if (value && !valueProps.fromMapViewport) {

            if (viewportObserverDisposer) {
                viewportObserverDisposer();
                viewportObserverDisposer = undefined;
                debouncedAoiUpdate.cancel();
            }

            if (!aoiInstance) {
                aoiInstance = props.aois.add({
                    id: `filterAoi${nextAoiId++}`,
                    name: valueProps.name ? valueProps.name : value.geometry.type,
                    geometry: value.geometry
                });

                props.filters.set(props.aoiFieldKey, {
                    ...value,
                    props: {
                        ...valueProps,
                        id: aoiInstance.id
                    },
                }, AOI_FIELD_ID);
            } else {
                aoiInstance.setGeometry(value.geometry);
                aoiInstance.setName(valueProps.name ? valueProps.name : value.geometry.type);

                if (!valueProps.id) {
                    props.filters.set(props.aoiFieldKey, {
                        geometry: value.geometry,
                        props: {
                            ...valueProps,
                            id: aoiInstance.id
                        }
                    }, AOI_FIELD_ID);
                }
            }
        } else {
            if (aoiInstance) {
                props.aois.remove(aoiInstance);
                aoiInstance = undefined;
            }
            if (value && valueProps.fromMapViewport) {
                if (!viewportObserverDisposer) {
                    viewportObserverDisposer = autorun(() => {
                        let renderer = props.map.renderer.implementation;
                        let viewport = {
                            ...props.map.view.viewport
                        };
                        if (renderer) {
                            let viewportExtent = renderer.getViewportExtent();
                            debouncedAoiUpdate({
                                ...value,
                                geometry: {
                                    type: 'BBox',
                                    bbox: viewportExtent,
                                },
                            });
                        }
                    });
                }
            } else {
                if (viewportObserverDisposer) {
                    viewportObserverDisposer();
                    viewportObserverDisposer = undefined;
                    debouncedAoiUpdate.cancel();
                }
            }
        }
    }, {
        fireImmediately: true
    });

    return () => {
        filterObserverDisposer();
        debouncedAoiUpdate.cancel();
        if (viewportObserverDisposer) {
            viewportObserverDisposer();
        }
        if (aoiInstance) {
            props.aois.remove(aoiInstance);
        }
    };
};
