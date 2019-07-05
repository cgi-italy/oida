import { useState, useEffect, useMemo } from 'react';
import { useObserver } from 'mobx-react-lite';

import { FeatureDrawMode, FeatureDrawEvent, SelectionMode, FEATURE_DRAW_INTERACTION_ID } from '@oida/core';
import { FeatureDrawInteraction, IFeatureDrawInteraction, IEntitySelection } from '@oida/state-mst';
import { AoiAction, AoiValue, FormFieldState } from '@oida/ui-react-core';

import { useAoiModuleState } from '../use-aoi-module-state';
import { IAOICollection, IAOI } from '../types/aoi';

export type MapAoiDrawerProps = {
    drawInteraction: IFeatureDrawInteraction;
    mapSelection: IEntitySelection;
    aois: IAOICollection;
} & FormFieldState<AoiValue>;

let nextAoiId = 1;

export const useMapAoiDrawer = ({drawInteraction, mapSelection, aois, value, onChange}: MapAoiDrawerProps) => {

    const  aoiId = useMemo(() => nextAoiId++, []);

    let [activeAction, setActiveAction] = useState(AoiAction.None);
    let [aoiInstance, setAoiInstance] = useState<IAOI | undefined>(undefined);

    useEffect(() => {

        if (value) {

            let aoi = aois.add({
                id: `drawnAoi${aoiId}`,
                name: value.name,
                geometry: value.geometry
            });

            setAoiInstance(aoi);

            return () => {
                aois.remove(aoi);
                setAoiInstance(undefined);
            };
        }
    }, [value]);

    const cancelDraw = () => {
        drawInteraction.setDrawMode(FeatureDrawMode.Off, {});
        setActiveAction(AoiAction.None);
    };

    const onDrawEnd = (evt: FeatureDrawEvent) => {
        onChange({
            name: `${evt.geometry.type} ${aoiId}`,
            geometry: evt.geometry
        });
        cancelDraw();
    };

    const drawBBox = () => {

        if (activeAction === AoiAction.DrawBBox) {
            cancelDraw();
        } else {
            drawInteraction.setDrawMode(FeatureDrawMode.BBox, {
                onDrawEnd
            });

            setActiveAction(AoiAction.DrawBBox);
        }
    };

    const drawPolygon = () => {

        if (activeAction === AoiAction.DrawPolygon) {
            cancelDraw();
        } else {
            drawInteraction.setDrawMode(FeatureDrawMode.Polygon, {
                onDrawEnd
            });

            setActiveAction(AoiAction.DrawPolygon);
        }
    };

    const onAoiHover = (hovered) => {
        if (hovered) {
            mapSelection.setHovered(aoiInstance);
        } else {
            mapSelection.setHovered(null);
        }
    };

    const onAoiSelect = (selected) => {
        mapSelection.modifySelection(aoiInstance, SelectionMode.Replace);
    };

    return useObserver(() => ({
        onDrawBBoxAction: drawBBox,
        onDrawPolygonAction: drawPolygon,
        activeAction: activeAction,
        onHoverAction: onAoiHover,
        onSelectAction: onAoiSelect,
        color: aoiInstance ? aoiInstance.color : null
    }));
};

export const useMapAoiDrawerFromModule = (aoiFieldState: FormFieldState<AoiValue>, aoiModule?) => {
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
        mapSelection: moduleState.mapModule.selection!,
        aois: moduleState.aois,
        ...aoiFieldState
    });
};

