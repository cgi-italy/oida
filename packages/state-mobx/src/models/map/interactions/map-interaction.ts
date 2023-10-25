import { action, makeObservable, observable } from 'mobx';
import { v4 as uuid } from 'uuid';

import { createDynamicFactory, IMapInteractionImplementation } from '@oidajs/core';

import { IsActivable, Active, ActiveProps } from '../../mixins';

const mapInteractionFactory = createDynamicFactory<MapInteraction>('mapInteractionFactory');

export type MapInteractionProps = {
    id?: string;
    interactionType: string;
} & ActiveProps;

export class MapInteraction implements IsActivable {
    static create(props: MapInteractionProps & Record<string, any>) {
        const { interactionType, ...config } = props;
        const mapInteraction = mapInteractionFactory.create(interactionType, config);
        if (!mapInteraction) {
            throw new Error(`Unable to create map interaction of type ${interactionType}`);
        }
        return mapInteraction;
    }

    static register<P extends Omit<MapInteractionProps, 'interactionType'>>(
        interactionType: string,
        interactionCtor: new (props: P) => MapInteraction
    ) {
        mapInteractionFactory.register(interactionType, (props: P) => {
            return new interactionCtor(props);
        });
    }

    readonly id: string;
    readonly interactionType: string;
    readonly active: Active;
    @observable.ref implementation: IMapInteractionImplementation | undefined;
    constructor(props: MapInteractionProps) {
        this.id = props.id || uuid();
        this.interactionType = props.interactionType;
        this.active = new Active(props);
        this.implementation = undefined;

        makeObservable(this);
    }

    @action
    setImplementation(implementation: IMapInteractionImplementation | undefined) {
        this.implementation = implementation;
    }
}
