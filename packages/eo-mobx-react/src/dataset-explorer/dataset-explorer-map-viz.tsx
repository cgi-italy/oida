import React, { useRef, useEffect } from 'react';

import { List } from 'antd';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import { DatasetExplorer, DatasetViz } from '@oida/eo-mobx';


import { DatasetVizListItem } from '../dataset-map-viz';
import { useSelector } from '@oida/ui-react-mobx';
import { MapLayer } from '@oida/state-mobx';

export type DatasetExplorerMapVizProps = {
    explorerState: DatasetExplorer;
};

let SortableItem = SortableElement(DatasetVizListItem);
let SortableList = SortableContainer(List);

export const DatasetExplorerMapViz = (props: DatasetExplorerMapVizProps) => {

    let datasetMapViews = useSelector(() => {
        return props.explorerState.items.map((datasetView) => {
            return {
                id: datasetView.dataset.id,
                mapViz: datasetView.mapViz
            };
        });
    }).filter(item => item.mapViz?.mapLayer instanceof MapLayer);

    let items = datasetMapViews.map((view, idx) => {
        return (
            <SortableItem
                key={view.id}
                index={idx}
                datasetExplorer={props.explorerState}
                datasetViz={view.mapViz as DatasetViz<MapLayer>}
                onRemove={() => props.explorerState.removeDataset(view.id)}
            />
        );
    });

    const componentRef = useRef<HTMLDivElement>(null);


    return (
        <div className='dataset-explorer-viz' ref={componentRef}>
            {!items.length &&
                <div>No dataset selected</div>
            }
            {!!items.length &&
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
                    {items}
                </SortableList>
            }
        </div>
    );
};