import { observable, makeObservable, action } from 'mobx';

import { FEATURE_HOVER_INTERACTION_ID } from '@oida/core';

import { MapInteraction, MapInteractionProps } from './map-interaction';
import { SelectionManager, SelectableItem } from '../../core';


export type FeatureHoverInteractionProps = {
    selectionManager?: SelectionManager<SelectableItem>
} & Omit<MapInteractionProps, 'interactionType'>;

export class FeatureHoverInteraction extends MapInteraction {
    @observable.ref selectionManager: SelectionManager<SelectableItem>;
    constructor(props: FeatureHoverInteractionProps) {
        super({
            ...props,
            interactionType: FEATURE_HOVER_INTERACTION_ID
        });

        this.selectionManager = props.selectionManager || new SelectionManager();

        makeObservable(this);
    }

    @action
    setSelectionManager(selectionManager: SelectionManager<SelectableItem>) {
        this.selectionManager = selectionManager;
    }
}

MapInteraction.register(FEATURE_HOVER_INTERACTION_ID, FeatureHoverInteraction);
