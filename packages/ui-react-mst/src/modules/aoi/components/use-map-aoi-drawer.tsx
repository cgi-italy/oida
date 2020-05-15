import { useMemo, useEffect } from 'react';

import { GeometryTypes, FeatureDrawMode, FeatureDrawEvent, FEATURE_DRAW_INTERACTION_ID } from '@oida/core';
import { FeatureDrawInteraction, IFeatureDrawInteraction, IMap } from '@oida/state-mst';
import { AoiAction, AoiValue, AoiSupportedGeometry, FormFieldState } from '@oida/core';

import { useAoiModuleState } from '../use-aoi-module-state';

type GeometryConstraints = {
    [type in GeometryTypes]: {
        maxCoords: number
    }
};

export type MapAoiDrawerProps = {
    drawInteraction: IFeatureDrawInteraction;
    activeAction: AoiAction,
    supportedGeometries: AoiSupportedGeometry[],
    onActiveActionChange: (action: AoiAction) => void
} & FormFieldState<AoiValue>;


export const useMapAoiDrawer = ({
    drawInteraction,
    supportedGeometries,
    activeAction,
    onActiveActionChange,
    onChange
}: MapAoiDrawerProps) => {

    const geometryConstraints = useMemo(() => {
        return supportedGeometries.reduce((constraints, geometry) => {
            return {
                ...constraints,
                [geometry.type]: geometry.constraints
            };
        }, {} as GeometryConstraints);
    }, [supportedGeometries]);

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
        } else if (activeAction === AoiAction.DrawLine) {
            drawInteraction.setDrawMode(FeatureDrawMode.Line, {
                onDrawEnd,
                ...geometryConstraints.LineString
            });
        } else if (activeAction === AoiAction.DrawBBox) {
            drawInteraction.setDrawMode(FeatureDrawMode.BBox, {
                onDrawEnd
            });
        } else if (activeAction === AoiAction.DrawPolygon) {
            drawInteraction.setDrawMode(FeatureDrawMode.Polygon, {
                onDrawEnd,
                ...geometryConstraints.Polygon
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
        ...props
    });
};

