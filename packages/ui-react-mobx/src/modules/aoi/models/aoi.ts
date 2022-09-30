import { observable, computed, makeObservable, action } from 'mobx';
import chroma from 'chroma-js';

import { randomColorFactory } from '@oidajs/core';
import { Entity, EntityProps, HasGeometry, GeometryProps, GeometryState } from '@oidajs/state-mobx';

const generateAoiColor = randomColorFactory();

export type AoiProps = {
    name: string;
    color?: string;
    properties?: Record<string, any>;
    pickable?: boolean;
} & Omit<EntityProps, 'entityType'> &
    GeometryProps;

export class Aoi extends Entity implements HasGeometry {
    @observable.ref name: string;
    @observable.ref geometry: GeometryState;
    @observable.ref pickable: boolean;
    readonly properties: Record<string, any> | undefined;
    @observable.ref protected baseColor_: string;

    constructor(props: AoiProps) {
        super({
            ...props,
            entityType: 'aoi'
        });
        this.baseColor_ = props.color || generateAoiColor();
        this.name = props.name;
        this.geometry = new GeometryState(props);
        this.pickable = typeof props.pickable === 'boolean' ? props.pickable : true;
        this.properties = props.properties;

        makeObservable(this);
    }

    @computed
    get color() {
        let color = this.baseColor_;
        if (this.selected.value) {
            color = '#FFFF00';
        } else if (this.hovered.value) {
            color = chroma(color).brighten(1).hex();
        }
        return color;
    }

    @action
    setName(name: string) {
        this.name = name;
    }

    @action
    setPickable(pickable: boolean) {
        this.pickable = pickable;
    }
}
