import { useMemo, useEffect } from 'react';

import { GeometryTypes, FeatureDrawMode, FeatureDrawEvent } from '@oidajs/core';
import { FeatureDrawInteraction } from '@oidajs/state-mobx';
import { AoiAction, AoiValue, AoiSupportedGeometry, FormFieldState } from '@oidajs/core';

import { useAoiModule } from './use-aoi-module';

type GeometryConstraints = {
    [type in GeometryTypes]: {
        maxCoords: number;
    };
};

export type MapAoiDrawerProps = {
    drawInteraction: FeatureDrawInteraction;
    activeAction: AoiAction;
    supportedGeometries: AoiSupportedGeometry[];
    onActiveActionChange: (action: AoiAction) => void;
} & FormFieldState<AoiValue>;

export const useMapAoiDrawer = (props: MapAoiDrawerProps) => {
    const { drawInteraction, supportedGeometries, activeAction, onActiveActionChange, onChange } = props;

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
            geometry: evt.geometry
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

export const useMapAoiDrawerFromModule = (props: Omit<MapAoiDrawerProps, 'map' | 'drawInteraction'>, aoiModuleId?: string) => {
    const moduleState = useAoiModule(aoiModuleId);

    let drawInteraction = moduleState.mapModule.map.interactions.items.find((interaction) => {
        return interaction instanceof FeatureDrawInteraction;
    }) as FeatureDrawInteraction | undefined;

    if (!drawInteraction) {
        drawInteraction = new FeatureDrawInteraction({});
        moduleState.mapModule.map.interactions.add(drawInteraction);
    }

    return useMapAoiDrawer({
        drawInteraction,
        ...props
    });
};
