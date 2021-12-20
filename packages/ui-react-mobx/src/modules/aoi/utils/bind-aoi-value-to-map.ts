import { autorun, reaction } from 'mobx';
import debounce from 'lodash/debounce';

import { AoiValue, randomColorFactory } from '@oidajs/core';
import { Map, IndexedCollection } from '@oidajs/state-mobx';

import { Aoi } from '../models';

export type bindAoiValueToMapProps = {
    getter: () => AoiValue | undefined;
    setter: (value: AoiValue | undefined) => void;
    aois: IndexedCollection<Aoi>;
    map: Map;
    viewportChangeDebounce?: number;
    color?: string;
};

let nextAoiId = 1;
const generateAoiColor = randomColorFactory();

/**
 * Automatically create an AOI instance based on the value of an AOI value (e.g. for map displaying).
 * Bind geometry value to current map viewport when fromViewport property is set on the Aoi Value.
 * @returns disposer function, which can be used to stop tracking the filter value and remove any created AOI instance/viewport observer.
 */
export const bindAoiValueToMap = (props: bindAoiValueToMapProps) => {

    let aoiInstance: Aoi | undefined;
    let viewportObserverDisposer: (() => void) | undefined;
    const color = props.color || generateAoiColor();

    const debouncedAoiUpdate = debounce((aoiValue: AoiValue) => {
        props.setter(aoiValue);
    }, props.viewportChangeDebounce || 1000);


    let filterObserverDisposer = reaction(() => props.getter(), (value) => {

        let valueProps = value ? value.props || {} : {};

        if (value && !valueProps.fromMapViewport) {

            if (viewportObserverDisposer) {
                viewportObserverDisposer();
                viewportObserverDisposer = undefined;
                debouncedAoiUpdate.cancel();
            }

            if (!aoiInstance) {
                aoiInstance = new Aoi({
                    id: `filterAoi${nextAoiId++}`,
                    name: valueProps.name ? valueProps.name : value.geometry.type,
                    geometry: value.geometry,
                    color: color,
                    visible: true
                });

                props.aois.add(aoiInstance);

                props.setter({
                    ...value,
                    props: {
                        ...valueProps,
                        id: aoiInstance.id.toString()
                    },
                });

            } else {
                aoiInstance.geometry.setValue(value.geometry);
                aoiInstance.setName(valueProps.name ? valueProps.name : value.geometry.type);

                if (!valueProps.id) {
                    props.setter({
                        geometry: value.geometry,
                        props: {
                            ...valueProps,
                            id: aoiInstance.id.toString()
                        }
                    });
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
                            center: props.map.view.viewport.center,
                            resolution: props.map.view.viewport.resolution,
                            pitch: props.map.view.viewport.pitch,
                            rotation: props.map.view.viewport.rotation
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
