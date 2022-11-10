import React, { useRef } from 'react';

import { List } from 'antd';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import { useSelector } from '@oidajs/ui-react-mobx';
import { Map, MapLayer } from '@oidajs/state-mobx';
import { DatasetExplorer, DatasetViz } from '@oidajs/eo-mobx';

import { ComboToolConfig } from '../hooks/use-dataset-explorer-tools';
import { DatasetVizDownloadModalProps, DatasetVizListItem } from '../dataset-map-viz';

export type DatasetExplorerMapVizProps = {
    explorerState: DatasetExplorer;
    analyticsTools?: ComboToolConfig[];
    mapState?: Map;
    datasetDownloadComponent?: React.ComponentType<DatasetVizDownloadModalProps>;
};

const SortableItem = SortableElement(DatasetVizListItem);
const SortableList = SortableContainer(List);

export const DatasetExplorerMapViz = (props: DatasetExplorerMapVizProps) => {
    const datasetMapViews = useSelector(() => {
        return props.explorerState.items.map((datasetView) => {
            return {
                id: datasetView.dataset.id,
                mapViz: datasetView.mapViz
            };
        });
    }).filter((item) => item.mapViz?.mapLayer instanceof MapLayer);

    const items = datasetMapViews.map((view, idx) => {
        return (
            <SortableItem
                key={view.id}
                index={idx}
                datasetExplorer={props.explorerState}
                analyticsTools={props.analyticsTools}
                datasetViz={view.mapViz as DatasetViz<string, MapLayer>}
                mapState={props.mapState}
                onRemove={() => props.explorerState.removeDataset(view.id)}
                downloadComponent={props.datasetDownloadComponent}
            />
        );
    });

    const componentRef = useRef<HTMLDivElement>(null);

    return (
        <div className='dataset-explorer-viz' ref={componentRef}>
            {!items.length && <div>No dataset selected</div>}
            {!!items.length && (
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
                    <ul className='ant-list-items'>{items}</ul>
                </SortableList>
            )}
        </div>
    );
};
