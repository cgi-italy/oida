import { useSelector } from '../../../core/hooks';

import { MouseCoordsInteraction } from '@oidajs/state-mobx';

import { useMapModule } from './use-map-module';

export type MapMouseCoordsProps = {
    mouseCoordsInteraction: MouseCoordsInteraction
};

export const useMapMouseCoords = (props: MapMouseCoordsProps) => {
    return useSelector(() => ({
        coords: props.mouseCoordsInteraction.mouseCoords
    }));
};

export const useMapMouseCoordsFromModule = (mapModuleId?: string) => {
    let moduleState = useMapModule(mapModuleId);

    let mouseCoordsInteraction = moduleState.map.interactions.items.find((interaction) => {
        return interaction instanceof MouseCoordsInteraction;
    }) as MouseCoordsInteraction | undefined;

    if (!mouseCoordsInteraction) {
        mouseCoordsInteraction = new MouseCoordsInteraction();
        moduleState.map.interactions.add(mouseCoordsInteraction);
    }

    return useMapMouseCoords({
        mouseCoordsInteraction
    });
};
