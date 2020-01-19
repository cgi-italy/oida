import { useState, useEffect } from 'react';

import { FeatureDrawMode, FeatureDrawEvent, FEATURE_DRAW_INTERACTION_ID } from '@oida/core';
import { FeatureDrawInteraction, IFeatureDrawInteraction, IMap } from '@oida/state-mst';
import { AoiAction, AoiValue, FormFieldState } from '@oida/ui-react-core';

import { useAoiModuleState } from '../use-aoi-module-state';

export type MapAoiDrawerProps = {
    drawInteraction: IFeatureDrawInteraction;
    map: IMap;
} & FormFieldState<AoiValue>;


export const useMapAoiDrawer = ({drawInteraction, map, value, onChange}: MapAoiDrawerProps) => {

    let [activeAction, setActiveAction] = useState(AoiAction.None);

    useEffect(() => {

        if (value) {

            let valueProps = value.props || {};

            if (valueProps.fromViewport) {
                setActiveAction(AoiAction.LinkToViewport);
                return;
            }

        }
    }, [value]);

    const onDrawEnd = (evt: FeatureDrawEvent) => {

        onChange({
            geometry: evt.geometry,
        });

        setActiveAction(AoiAction.None);
    };

    const drawPoint = () => {

        if (activeAction === AoiAction.DrawPoint) {
            setActiveAction(AoiAction.None);
        } else {
            setActiveAction(AoiAction.DrawPoint);
        }
    };

    const drawBBox = () => {

        if (activeAction === AoiAction.DrawBBox) {
            setActiveAction(AoiAction.None);
        } else {
            setActiveAction(AoiAction.DrawBBox);
        }
    };

    const drawPolygon = () => {

        if (activeAction === AoiAction.DrawPolygon) {
            setActiveAction(AoiAction.None);
        } else {
            setActiveAction(AoiAction.DrawPolygon);
        }
    };

    const linkToViewport = () => {
        if (activeAction === AoiAction.LinkToViewport) {
            onChange(undefined);
            setActiveAction(AoiAction.None);
        } else {
            onChange({
                geometry: {
                    type: 'BBox',
                    bbox: map.renderer.implementation!.getViewportExtent()
                },
                props: {
                    fromViewport: true
                }
            });
        }
    };

    useEffect(() => {

        if (activeAction === AoiAction.DrawPoint) {
            drawInteraction.setDrawMode(FeatureDrawMode.Point, {
                onDrawEnd
            });

            return () => {
                drawInteraction.setDrawMode(FeatureDrawMode.Off, {});
            };
        } else if (activeAction === AoiAction.DrawBBox) {
            drawInteraction.setDrawMode(FeatureDrawMode.BBox, {
                onDrawEnd
            });

            return () => {
                drawInteraction.setDrawMode(FeatureDrawMode.Off, {});
            };
        } else if (activeAction === AoiAction.DrawPolygon) {
            drawInteraction.setDrawMode(FeatureDrawMode.Polygon, {
                onDrawEnd
            });

            return () => {
                drawInteraction.setDrawMode(FeatureDrawMode.Off, {});
            };
        }

    }, [activeAction]);


    return {
        onDrawPointAction: drawPoint,
        onDrawBBoxAction: drawBBox,
        onDrawPolygonAction: drawPolygon,
        onLinkToViewportAction: linkToViewport,
        activeAction: activeAction
    };
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
        map: moduleState.map,
        ...aoiFieldState
    });
};

