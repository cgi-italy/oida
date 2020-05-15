import { useState, useEffect } from 'react';

import { FormFieldState, AoiValue, AoiAction } from '@oida/core';

import { useMapAoiDrawer, MapAoiDrawerProps, useMapAoiDrawerFromModule } from './use-map-aoi-drawer';
import { useMapAoiInstance, MapAoiInstanceProps, useMapAoiInstanceFromModule } from './use-map-aoi-instance';
import { useMapAoiViewport, MapAoiViewportProps, useMapAoiViewportFromModule } from './use-map-aoi-viewport';
import { useMapAoiImporter, MapAoiImporterProps, useMapAoiImporterFromModule } from './use-map-aoi-importer';

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

export type MapAoiFieldProps = Omit<MapAoiDrawerProps, 'activeAction' | 'onActiveActionChange'>
& MapAoiInstanceProps
& Omit<MapAoiViewportProps, 'activeAction' | 'onActiveActionChange'>
& Omit<MapAoiImporterProps, 'onActiveActionChange'>;

export const useMapAoiField = (props: MapAoiFieldProps) => {

    let {activeAction, onActiveActionChange} = useAoiAction();

    useMapAoiDrawer({
        ...props,
        activeAction,
        onActiveActionChange
    });

    let aoiInstanceProps = useMapAoiInstance({
        ...props
    });

    let viewportProps = useMapAoiViewport({
        ...props,
        activeAction,
        onActiveActionChange
    });

    let importerProps = useMapAoiImporter({
        ...props,
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

export const useMapAoiFieldFromModule =
(props: FormFieldState<AoiValue>, aoiModule?) => {

    let {activeAction, onActiveActionChange} = useAoiAction();

    useMapAoiDrawerFromModule({
        ...props,
        activeAction,
        onActiveActionChange
    }, aoiModule);

    let aoiInstanceProps = useMapAoiInstanceFromModule({
        ...props
    });

    let viewportProps = useMapAoiViewportFromModule({
        ...props,
        activeAction,
        onActiveActionChange
    });

    let importerProps = useMapAoiImporterFromModule({
        ...props,
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
