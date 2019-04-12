import { IMapRenderer } from '@oida/core';

import { types } from 'mobx-state-tree';

export const MapRenderer = types
    .model('MapRenderer', {
        id: types.string,
        props: types.optional(types.frozen(), {})
    }).actions((self) => {
        return {
            setProperties: (props) => {
                self.props = {
                    ...self.props,
                    ...props
                };
            }
        };
    }).volatile(self => ({
        implementation: undefined as (IMapRenderer | undefined)
    })).actions((self) => {
        return {
            setImplementation(implementation: IMapRenderer | undefined) {
                self.implementation = implementation;
            }
        };
    });
