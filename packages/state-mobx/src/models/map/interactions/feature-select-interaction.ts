import { observable, makeObservable, action } from 'mobx';

import { FEATURE_SELECT_INTERACTION_ID } from '@oidajs/core';

import { MapInteraction, MapInteractionProps } from './map-interaction';
import { SelectionManager, SelectableItem } from '../../core';
import { Config, ConfigProps, HasConfig } from '../../mixins';

export type FeatureSelectInteractionConfig = {
    multiple: boolean
};

export type FeatureSelectInteractionProps = {
    selectionManager?: SelectionManager<SelectableItem>
} & Omit<MapInteractionProps, 'interactionType'> & ConfigProps<FeatureSelectInteractionConfig>;

export class FeatureSelectInteraction extends MapInteraction implements HasConfig<FeatureSelectInteractionConfig> {
    readonly config: Config<FeatureSelectInteractionConfig>;
    @observable.ref selectionManager: SelectionManager<SelectableItem>;
    constructor(props: FeatureSelectInteractionProps) {
        super({
            ...props,
            interactionType: FEATURE_SELECT_INTERACTION_ID
        });
        this.config = new Config(props);
        this.selectionManager = props.selectionManager || new SelectionManager();

        makeObservable(this);
    }

    @action
    setSelectionManager(selectionManager: SelectionManager<SelectableItem>) {
        this.selectionManager = selectionManager;
    }
}

MapInteraction.register(FEATURE_SELECT_INTERACTION_ID, FeatureSelectInteraction);
