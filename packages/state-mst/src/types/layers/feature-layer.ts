import { types, Instance } from 'mobx-state-tree';

import { FEATURE_LAYER_ID, Geometry, IFeatureStyle } from '@oida/core';

import { hasOptionalConfig } from '../mixins/has-config';
import { getEntityCollectionType } from '../entity/entity-collection';
import { ReferenceOrType } from '../mst/reference-or-type';
import { IEntity } from '../entity';

import { MapLayer } from './map-layer';

export type EntityGeometryGetter<T extends IEntity> = (entity: T) => Geometry | undefined;
export type EntityStyleGetter<T extends IEntity> = (entity: T) => IFeatureStyle | IFeatureStyle[];

export type FeatureLayerConfig<T extends IEntity> = {
    geometryGetter?: EntityGeometryGetter<T>;
    styleGetter?: EntityStyleGetter<T>;
    rendererOptions?: Record<string, {[props: string]: any}>;
    onEntityHover?: (entity: T, coordinate: GeoJSON.Position) => void;
};

const FeatureLayerDecl = MapLayer.addModel(
    types.compose(
        FEATURE_LAYER_ID,
        types.model({
            source: ReferenceOrType(getEntityCollectionType())
        })
        .actions((self) => {
            return {
                setSource: (source) => {
                    self.source = source;
                }
            };
        }),
        hasOptionalConfig<FeatureLayerConfig<any>>()
    )
);

type FeatureLayerType = typeof FeatureLayerDecl;
export interface FeatureLayerInterface extends FeatureLayerType {}
export const FeatureLayer: FeatureLayerInterface = FeatureLayerDecl;
export interface IFeatureLayer extends Instance<FeatureLayerInterface> {}

