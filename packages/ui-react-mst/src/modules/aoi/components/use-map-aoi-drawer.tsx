import { useState, useEffect } from 'react';

import { FeatureDrawMode, FeatureDrawEvent, FEATURE_DRAW_INTERACTION_ID } from '@oida/core';
import { FeatureDrawInteraction, IFeatureDrawInteraction, IMap } from '@oida/state-mst';
import { AoiAction, AoiValue, FormFieldState } from '@oida/core';

import { useAoiModuleState } from '../use-aoi-module-state';

export type MapAoiDrawerProps = {
    drawInteraction: IFeatureDrawInteraction;
    map: IMap;
    activeAction: AoiAction,
    onActiveActionChange: (action: AoiAction) => void
} & FormFieldState<AoiValue>;


export const useMapAoiDrawer = ({drawInteraction, map, activeAction, onActiveActionChange, onChange}: MapAoiDrawerProps) => {

    const onDrawEnd = (evt: FeatureDrawEvent) => {

        onChange({
            geometry: evt.geometry,
        });

        onActiveActionChange(AoiAction.None);
    };

    useEffect(() => {

        if (activeAction === AoiAction.None) {
            drawInteraction.setDrawMode(FeatureDrawMode.Off, {});
        } else if (activeAction === AoiAction.DrawPoint) {
            drawInteraction.setDrawMode(FeatureDrawMode.Point, {
                onDrawEnd
            });
        } else if (activeAction === AoiAction.DrawBBox) {
            drawInteraction.setDrawMode(FeatureDrawMode.BBox, {
                onDrawEnd
            });
        } else if (activeAction === AoiAction.DrawPolygon) {
            drawInteraction.setDrawMode(FeatureDrawMode.Polygon, {
                onDrawEnd
            });
        }

        return () => {
            drawInteraction.setDrawMode(FeatureDrawMode.Off, {});
        };

    }, [activeAction]);
};

export const useMapAoiDrawerFromModule = (props: Omit<MapAoiDrawerProps, 'map' | 'drawInteraction'>, aoiModule?) => {
    let moduleState = useAoiModuleState(aoiModule);

    let drawInteraction = moduleState.map.interactions.items.find((interaction) => {
        return interaction.mapInteractionType === FEATURE_DRAW_INTERACTION_ID;
    }) as IFeatureDrawInteraction;


    if (!drawInteraction) {
        drawInteraction = FeatureDrawInteraction.create({
            id: FEATURE_DRAW_INTERACTION_ID
        });
        moduleState.map.interactions.add(drawInteraction);
    }

    return useMapAoiDrawer({
        drawInteraction,
        map: moduleState.map,
        ...props
    });
};

