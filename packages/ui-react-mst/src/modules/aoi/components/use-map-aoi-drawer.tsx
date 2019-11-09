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

let nextAoiId = 1;

export const useMapAoiDrawer = ({drawInteraction, mapSelection, aois, map, value, onChange}: MapAoiDrawerProps) => {

    let [activeAction, setActiveAction] = useState(AoiAction.None);
    let [aoiInstance, setAoiInstance] = useState<IAOI | undefined>(undefined);

    useEffect(() => {

        if (value) {

            let valueProps = value.props || {};

            if (valueProps.mode === 'viewport') {
                setActiveAction(AoiAction.LinkToViewport);
                return;
            }

            let aoiId = valueProps.id || `drawnAoi${nextAoiId++}`;

            let aoi = aois.add({
                id: aoiId,
                name: value.name,
                defaultColor: valueProps.color,
                geometry: value.geometry
            });

            setAoiInstance(aoi);

            if (!valueProps.color || !valueProps.id) {
                onChange({
                    ...value,
                    props: {
                        ...valueProps,
                        color: aoi.defaultColor,
                        id: aoi.id
                    }
                });
            }

            return () => {
                aois.remove(aoi);
                setAoiInstance(undefined);
            };

        }
    }, [value]);

    const onDrawEnd = (evt: FeatureDrawEvent) => {

        let currentProps = value ? value.props || {} : {};

        onChange({
            name: `${evt.geometry.type}`,
            geometry: evt.geometry,
            props: {
                ...currentProps,
                mode: 'manual'
            }
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
            setActiveAction(AoiAction.None);
        } else {
            setActiveAction(AoiAction.LinkToViewport);
        }
    };


    const debouncedOnchange = debounce((aoi) => {
        onChange(aoi);
    }, 500);

    let mapViewport = useMapViewport({
        map: map,
        debounce: 500
    });

    const setCurrentViewport = () => {
        if (mapViewport) {

            let currentProps = value ? value.props || {} : {};

            onChange({
                name: `Current viewport`,
                geometry: {
                    type: 'BBox',
                    bbox: mapViewport,
                },
                props: {
                    ...currentProps,
                    mode: 'viewport'
                }
            });
        }
    };

    useEffect(() => {
        if (activeAction === AoiAction.LinkToViewport) {
            setCurrentViewport();
        }
    }, [mapViewport]);


    useEffect(() => {

        if (activeAction === AoiAction.LinkToViewport) {

            setCurrentViewport();

            return () => {
                 onChange(undefined);
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

    const onAoiHover = (hovered) => {
        if (hovered) {
            mapSelection.setHovered(aoiInstance);
        } else {
            mapSelection.setHovered(null);
        }
    };

    const onAoiSelect = (selected) => {
        mapSelection.modifySelection(aoiInstance, SelectionMode.Replace);
        if (aoiInstance) {
            map.renderer.implementation!.fitExtent(getGeometryExtent(aoiInstance.geometry), true);
        }
    };

    let color = useObserver(() => {
        return aoiInstance ? aoiInstance.color : null;
    });

    return {
        onDrawBBoxAction: drawBBox,
        onDrawPolygonAction: drawPolygon,
        onLinkToViewportAction: linkToViewport,
        activeAction: activeAction,
        onHoverAction: onAoiHover,
        onSelectAction: onAoiSelect,
        color: color
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

