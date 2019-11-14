import React, { useRef, useEffect } from 'react';
import { useObserver } from 'mobx-react';
import { List } from 'antd';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import { IDatasetsExplorer } from '@oida/eo';


import { DatasetVizListItem } from '../dataset-map-viz';

export type DatasetExplorerMapVizProps = {
    explorerState: IDatasetsExplorer;
};

let SortableItem = SortableElement(DatasetVizListItem);
let SortableList = SortableContainer(List);

export const DatasetExplorerMapViz = (props: DatasetExplorerMapVizProps) => {

    useEffect(() => {
        props.explorerState.setVizExplorerActive(true);
        return () => {
            props.explorerState.setVizExplorerActive(false);
        };
    });

    let datasetMapViews = useObserver(() => {
        return props.explorerState.datasetViews.map((datasetView) => {
            return {
                id: datasetView.dataset.id,
                mapViz: datasetView.mapViz!
            };
        });
    });

    let items = datasetMapViews.map((view, idx) => {
        return (
            <SortableItem key={view.id} index={idx} datasetViz={view.mapViz}/>
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
                        itemLayout='vertical'
                    >
                        {items}
                    </SortableList>
                }
            </div>
    );
};
