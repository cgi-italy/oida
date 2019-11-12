import { useState, useEffect } from 'react';
import { useObserver } from 'mobx-react-lite';
import { autorun } from 'mobx';
import debounce from 'lodash/debounce';

import { getGeometryExtent, FeatureDrawMode, FeatureDrawEvent, SelectionMode, FEATURE_DRAW_INTERACTION_ID } from '@oida/core';
import { FeatureDrawInteraction, IFeatureDrawInteraction, IEntitySelection, IMap } from '@oida/state-mst';
import { AoiAction, AoiValue, FormFieldState } from '@oida/ui-react-core';

import { useAoiModuleState } from '../use-aoi-module-state';
import { IAOICollection, IAOI } from '../types/aoi';

import { useMapViewport } from '../../map';

export type MapAoiDrawerProps = {
    drawInteraction: IFeatureDrawInteraction;
    mapSelection: IEntitySelection;
    map: IMap;
    aois: IAOICollection;
} & FormFieldState<AoiValue>;


export const useMapAoiDrawer = ({drawInteraction, mapSelection, aois, map, value, onChange}: MapAoiDrawerProps) => {

    let [activeAction, setActiveAction] = useState(AoiAction.None);

    useEffect(() => {

        if (value) {

            let valueProps = value.props || {};

            if (valueProps.fromViewport) {
                setActiveAction(AoiAction.LinkToViewport);
                return;
            }


            let aoiInstance = getAoiInstance();
            if (aoiInstance) {
                aoiInstance.setVisible(true);
            }

            return () => {
                let aoiInstance = getAoiInstance();
                if (aoiInstance) {
                    aoiInstance.setVisible(false);
                }
            };

        }
    }, [value]);

    const getAoiInstance = () => {
        if (value && value.props && value.props.id) {
            return aois.itemWithId(value.props.id);
        } else {
            return undefined;
        }
    };

    const onDrawEnd = (evt: FeatureDrawEvent) => {

        onChange({
            geometry: evt.geometry,
        });

        setActiveAction(AoiAction.None);
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

        if (activeAction === AoiAction.DrawBBox) {
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

    const onAoiHover = (hovered) => {
        if (hovered) {
            mapSelection.setHovered(getAoiInstance());
        } else {
            mapSelection.setHovered(null);
        }
    };

    const onAoiSelect = (selected) => {
        let aoiInstance = getAoiInstance();
        mapSelection.modifySelection(aoiInstance, SelectionMode.Replace);
        if (aoiInstance) {
            map.renderer.implementation!.fitExtent(getGeometryExtent(aoiInstance.geometry), true);
        }
    };

    let aoiProps = useObserver(() => {
        let aoiInstance = getAoiInstance();
        if (aoiInstance) {
            return {
                color: aoiInstance.color,
                name: aoiInstance.name
            };
        } else {
            return {
                color: null,
                name: value && value.props && value.props.fromViewport ? 'Current viewport' : 'None'
            };
        }
    });

    return {
        onDrawBBoxAction: drawBBox,
        onDrawPolygonAction: drawPolygon,
        onLinkToViewportAction: linkToViewport,
        activeAction: activeAction,
        onHoverAction: onAoiHover,
        onSelectAction: onAoiSelect,
        color: aoiProps.color,
        name: aoiProps.name
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
        mapSelection: moduleState.mapModule.selection!,
        aois: moduleState.aois,
        map: moduleState.map,
        ...aoiFieldState
    });
};

