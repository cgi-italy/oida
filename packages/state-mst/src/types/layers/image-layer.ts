import { types, Instance } from 'mobx-state-tree';

import { IMAGE_LAYER_ID, ImageSourceConfig } from '@oida/core';

import { MapLayer } from './map-layer';

const ImageLayerDecl = MapLayer.addModel(
    types.model(IMAGE_LAYER_ID, {
        sourceType: types.maybe(types.string)
    })
    .volatile((self) => {
        return {
            sourceConfig: undefined as any,
        };
    })
    .actions((self) => {
        return {
            setSource: (source?: ImageSourceConfig) => {
                if (source) {
                    self.sourceType = source.type;
                    self.sourceConfig = source.config;
                } else {
                    self.sourceType = undefined;
                    self.sourceConfig = undefined;
                }
            }
        };
    })
);

type ImageLayerType = typeof ImageLayerDecl;
export interface ImageLayerInterface extends ImageLayerType {}
export const ImageLayer: ImageLayerInterface = ImageLayerDecl;
export interface IImageLayer extends Instance<ImageLayerInterface> {}

