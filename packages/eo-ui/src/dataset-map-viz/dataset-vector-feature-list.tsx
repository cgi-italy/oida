import React from 'react';
import { useObserver } from 'mobx-react';

import { FullscreenExitOutlined } from '@ant-design/icons';

import { DataCollectionList } from '@oida/ui-react-antd';
import { useEntityCollectionList, useDataPaging, useDataSorting, useMapModuleState, useCenterOnMapFromModule } from '@oida/ui-react-mst';
import { IDatasetVectorViz, IDatasetVectorFeature } from '@oida/eo';

import { DatasetVectorFeatureInfo } from './dataset-vector-feature-info';

export type DatasetVectorFeatureListProps = {
    datasetViz: IDatasetVectorViz
};

export const DatasetVectorFeatureList = (props: DatasetVectorFeatureListProps) => {
    const mapModule = useMapModuleState();
    const centerOnMap = useCenterOnMapFromModule();

    const items = useEntityCollectionList<IDatasetVectorFeature>({
        collection: props.datasetViz.data,
        entitySelection: mapModule.selection,
        actions: [
            {
                name: 'Center on map',
                callback: (item) => centerOnMap(item.geometry, {animate: true}),
                icon: <FullscreenExitOutlined/>
            }
        ]
    });

    const loadingState = useObserver(() => props.datasetViz.mapLayer?.loadingState);

    if (!items) {
        return null;
    }

    return (
        <div className='dataset-vector-feature-list'>
            <div className='dataset-vector-feature-list-title'>Data list:</div>
            <DataCollectionList<IDatasetVectorFeature>
                className='dataset-vector-feature-items'
                itemLayout='horizontal'
                meta={(item) => {
                    return {
                        title: props.datasetViz.config.contentGetter(item)
                    };
                }}
                items={{
                    ...items,
                    loadingState: loadingState
                }}
                autoScrollOnSelection={true}
            />
            {!!items.data.length &&
                <DatasetVectorFeatureInfo
                    selection={mapModule.selection}
                    infoTemplate={props.datasetViz.config.infoTemplate}
                />
            }
        </div>
    );

};
