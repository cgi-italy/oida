import { useState } from 'react';

import { AoiAction } from '@oidajs/core';

import { useMapAoiDrawer, MapAoiDrawerProps, useMapAoiDrawerFromModule } from './use-map-aoi-drawer';
import { useMapAoiInstance, MapAoiInstanceProps, useMapAoiInstanceFromModule } from './use-map-aoi-instance';
import { useMapAoiViewport, MapAoiViewportProps, useMapAoiViewportFromModule } from './use-map-aoi-viewport';
import { useMapAoiImporter, MapAoiImporterProps } from './use-map-aoi-importer';

export const useAoiAction = () => {
    const [activeAction, setActiveAction] = useState(AoiAction.None);

    const onActiveActionChange = (action: AoiAction) => {
        setActiveAction(action);
    };

    return {
        activeAction,
        onActiveActionChange
    };
};

export type MapAoiFieldProps = Omit<MapAoiDrawerProps, 'activeAction' | 'onActiveActionChange'> &
    MapAoiInstanceProps &
    Omit<MapAoiViewportProps, 'activeAction' | 'onActiveActionChange'> &
    Omit<MapAoiImporterProps, 'activeAction' | 'onActiveActionChange'>;

export const useMapAoiField = (props: MapAoiFieldProps) => {
    const { activeAction, onActiveActionChange } = useAoiAction();

    useMapAoiDrawer({
        ...props,
        activeAction,
        onActiveActionChange
    });

    const aoiInstanceProps = useMapAoiInstance({
        ...props
    });

    const viewportProps = useMapAoiViewport({
        ...props,
        activeAction,
        onActiveActionChange
    });

    const importerProps = useMapAoiImporter({
        ...props,
        activeAction,
        onActiveActionChange
    });

    return {
        onActiveActionChange,
        activeAction,
        importConfig: importerProps,
        ...aoiInstanceProps,
        ...viewportProps
    };
};

export const useMapAoiFieldFromModule = (
    props: Omit<MapAoiFieldProps, 'map' | 'aois' | 'aoiModule' | 'mapSelection' | 'drawInteraction'>,
    aoiModule?
) => {
    const { activeAction, onActiveActionChange } = useAoiAction();

    useMapAoiDrawerFromModule(
        {
            ...props,
            activeAction,
            onActiveActionChange
        },
        aoiModule
    );

    const aoiInstanceProps = useMapAoiInstanceFromModule({
        ...props
    });

    const viewportProps = useMapAoiViewportFromModule({
        ...props,
        activeAction,
        onActiveActionChange
    });

    const importerProps = useMapAoiImporter({
        ...props,
        activeAction,
        onActiveActionChange
    });

    return {
        onActiveActionChange,
        activeAction,
        importConfig: importerProps,
        ...aoiInstanceProps,
        ...viewportProps
    };
};
