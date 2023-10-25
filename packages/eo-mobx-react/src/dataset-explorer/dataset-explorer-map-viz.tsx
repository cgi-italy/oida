import React, { useRef } from 'react';
import { List, ListProps } from 'antd';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import { ILayerSwipeInteractionImplementation, LAYER_SWIPE_INTERACTION_ID } from '@oidajs/core';
import { LayerSwipeInteraction, Map, MapLayer } from '@oidajs/state-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetExplorer, DatasetViz } from '@oidajs/eo-mobx';

import { ComboToolConfig } from '../hooks/use-dataset-explorer-tools';
import { DatasetVizDownloadModalProps, DatasetVizListItem, DatasetVizListItemProps } from '../dataset-map-viz';

export type DatasetExplorerMapVizProps = {
    explorerState: DatasetExplorer;
    analyticsTools?: ComboToolConfig[];
    mapState?: Map;
    disableDatasetRenaming?: boolean;
    datasetDownloadComponent?: React.ComponentType<DatasetVizDownloadModalProps>;
};

const SortableItem = SortableElement<DatasetVizListItemProps>(DatasetVizListItem);
const SortableList = SortableContainer<ListProps<any>>(List);

export const DatasetExplorerMapViz = (props: DatasetExplorerMapVizProps) => {
    const swipeInteraction = useSelector(() => {
        return props.mapState?.interactions.items.find((interaction) => interaction.interactionType === LAYER_SWIPE_INTERACTION_ID) as
            | LayerSwipeInteraction
            | undefined;
    });

    const datasetMapViewItems = useSelector(() => {
        return props.explorerState.items.map((datasetView, idx) => {
            const mapViz = datasetView.mapViz;
            if (mapViz && mapViz.mapLayer) {
                let comparisonConfig: DatasetVizListItemProps['comparison'];
                let isComparisonTarget = false;
                if (swipeInteraction?.implementation) {
                    const swipeSupportedLayers = (
                        swipeInteraction.implementation as ILayerSwipeInteractionImplementation
                    ).getSupportedLayerTypes();
                    const isSwipeSupported = swipeSupportedLayers.indexOf(mapViz.mapLayer.layerType) !== -1;
                    if (isSwipeSupported) {
                        isComparisonTarget = mapViz.mapLayer === swipeInteraction.targetLayer;
                        comparisonConfig = {
                            isTarget: isComparisonTarget,
                            onSetIsTargetToggle: () => {
                                if (isComparisonTarget) {
                                    swipeInteraction.setTargetLayer(undefined);
                                } else {
                                    swipeInteraction.setTargetLayer(mapViz.mapLayer);
                                }
                            }
                        };
                    }
                }

                return (
                    <SortableItem
                        key={datasetView.dataset.id}
                        index={idx}
                        datasetExplorer={props.explorerState}
                        analyticsTools={props.analyticsTools}
                        datasetViz={mapViz as DatasetViz<string, MapLayer>}
                        mapState={props.mapState}
                        onRemove={() => {
                            props.explorerState.removeDataset(datasetView.dataset.id);
                            if (isComparisonTarget) {
                                //TODO: should this be done automatically by the
                                // swipe interaction on target layer remove?
                                swipeInteraction!.setTargetLayer(undefined);
                            }
                        }}
                        downloadComponent={props.datasetDownloadComponent}
                        disableRenaming={props.disableDatasetRenaming}
                        comparison={comparisonConfig}
                    />
                );
            } else {
                return null;
            }
        });
    });

    const componentRef = useRef<HTMLDivElement>(null);

    return (
        <div className='dataset-explorer-viz' ref={componentRef}>
            {!datasetMapViewItems.length && <div>No dataset selected</div>}
            {!!datasetMapViewItems.length && (
                <SortableList
                    useDragHandle={true}
                    helperContainer={() => {
                        return componentRef.current
                            ? componentRef.current.querySelector('.ant-spin-container') || document.body
                            : document.body;
                    }}
                    onSortEnd={(data) => {
                        props.explorerState.moveDataset(data.oldIndex, data.newIndex);
                    }}
                    size='small'
                    itemLayout='horizontal'
                >
                    <ul className='ant-list-items'>{datasetMapViewItems}</ul>
                </SortableList>
            )}
        </div>
    );
};
