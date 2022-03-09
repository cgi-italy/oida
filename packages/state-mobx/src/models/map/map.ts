import { makeObservable, observable, action } from 'mobx';

import { MapView, MapViewProps } from './map-view';
import { MapRenderer, MapRendererProps } from './map-renderer';
import { GroupLayer, GroupLayerProps } from './layers/group-layer';
import { IndexedCollection } from '../core';
import { MapInteraction, MapInteractionProps } from './interactions';

export type MapProps = {
    view: MapView | MapViewProps;
    renderer: MapRenderer | MapRendererProps;
    layers?: GroupLayer | GroupLayerProps;
    interactions?: Array<MapInteraction | MapInteractionProps>;
};

export class Map {
    readonly layers: GroupLayer;
    readonly interactions: IndexedCollection<MapInteraction>;
    @observable.ref view: MapView;
    @observable.ref renderer: MapRenderer;

    constructor(props: MapProps) {
        this.view = props.view instanceof MapView ? props.view : new MapView(props.view);
        this.renderer = props.renderer instanceof MapRenderer ? props.renderer : new MapRenderer(props.renderer);
        if (props.layers) {
            this.layers = props.layers instanceof GroupLayer ? props.layers : new GroupLayer(props.layers);
        } else {
            this.layers = new GroupLayer({
                id: 'rootLayers'
            });
        }

        this.interactions = new IndexedCollection({
            idGetter: (item) => item.id,
            items: (props.interactions || []).map((item) => (item instanceof MapInteraction ? item : MapInteraction.create(item)))
        });

        makeObservable(this);
    }

    @action
    setView(view: MapViewProps) {
        this.view = new MapView(view);
    }

    @action
    setRenderer(renderer: MapRendererProps) {
        this.renderer = new MapRenderer(renderer);
    }
}
