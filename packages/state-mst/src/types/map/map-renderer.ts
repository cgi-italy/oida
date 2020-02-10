import { IMapRenderer } from '@oida/core';

import { types } from 'mobx-state-tree';

const MapRendererDecl = types
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


type MapRendererType = typeof MapRendererDecl;
export interface MapRendererInterface extends MapRendererType {}
export const MapRenderer: MapRendererInterface = MapRendererDecl;
