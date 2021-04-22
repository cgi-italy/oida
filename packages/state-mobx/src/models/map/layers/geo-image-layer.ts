import { MapLayer, MapLayerProps } from './map-layer';
import { GEO_IMAGE_LAYER_ID, GeoImageLayerSource, GeoImageLayerFootprint } from '@oida/core';
import { observable, makeObservable, action } from 'mobx';


export type GeoImageLayerConfig = {
    srs?: string;
    dynamicFootprint?: boolean;
};

export type GeoImageLayerProps = {
    source?: GeoImageLayerSource,
    footprint: GeoImageLayerFootprint,
    config: GeoImageLayerConfig
} & MapLayerProps<typeof GEO_IMAGE_LAYER_ID>;

export class GeoImageLayer extends MapLayer {

    @observable.ref source: GeoImageLayerSource | undefined;
    @observable.ref sourceRevision: number;
    @observable.ref footprint: GeoImageLayerFootprint;
    readonly config: GeoImageLayerConfig;

    constructor(props: Omit<GeoImageLayerProps, 'layerType'>) {
        super({
            ...props,
            layerType: GEO_IMAGE_LAYER_ID
        });

        this.source = props.source;
        this.footprint = props.footprint;
        this.config = props.config;
        this.sourceRevision = 0;

        makeObservable(this);
    }

    @action
    setSource(source: GeoImageLayerSource) {
        this.source = source;
    }

    @action
    setFootprint(footprint: GeoImageLayerFootprint) {
        if (!this.config.dynamicFootprint) {
            throw new Error('GeoImageLayer: cannot update footprint for layer with no dynamicFootprint flag set');
        }
        this.footprint = footprint;
    }

    @action
    forceRefresh() {
        this.sourceRevision++;
    }
}
