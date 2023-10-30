import { LayerSwipeInteraction, Map } from '@oidajs/state-mobx';
import { MapLayerSwipeControlProps } from '@oidajs/ui-react-core';

import { useSelector } from '../../../core';
import { useMapModule } from './use-map-module';

export type UseLayerSwipeInteractionProps = {
    layerSwipeInteraction: LayerSwipeInteraction;
    map: Map;
};

export const useLayerSwipeInteraction = (props: UseLayerSwipeInteractionProps): MapLayerSwipeControlProps | undefined => {
    return useSelector(() => {
        const mapTarget = props.map.view.target;
        if (mapTarget) {
            return {
                swipePosition: props.layerSwipeInteraction.swipePosition,
                active: props.layerSwipeInteraction.active.value && !!props.layerSwipeInteraction.targetLayer?.renderer,
                onSwipePositionChange: (position) => props.layerSwipeInteraction.setSwipePosition(position),
                mapTarget: mapTarget,
                targetLayerId: props.layerSwipeInteraction.targetLayer?.id
            };
        } else {
            return undefined;
        }
    }, [props.layerSwipeInteraction]);
};

export const useLayerSwipeInteractionFromModule = (mapModuleId?: string) => {
    const moduleState = useMapModule(mapModuleId);

    let layerSwipeInteraction = moduleState.map.interactions.items.find((interaction) => {
        return interaction instanceof LayerSwipeInteraction;
    }) as LayerSwipeInteraction | undefined;

    if (!layerSwipeInteraction) {
        layerSwipeInteraction = new LayerSwipeInteraction();
        moduleState.map.interactions.add(layerSwipeInteraction);
    }

    return useLayerSwipeInteraction({
        layerSwipeInteraction: layerSwipeInteraction,
        map: moduleState.map
    });
};
