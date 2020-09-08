import React from 'react';
import { useObserver } from 'mobx-react';

import { Empty } from 'antd';

import { IDatasetVectorFeature } from '@oida/eo';
import { IEntitySelection } from '@oida/state-mst';


export type DatasetVectorFeatureInfoProps = {
    infoTemplate: (feature: IDatasetVectorFeature) => React.ReactNode
    selection: IEntitySelection
};

export const DatasetVectorFeatureInfo = (props: DatasetVectorFeatureInfoProps) => {

    let selectedFeature: IDatasetVectorFeature | undefined;

    let selectedMapFeatures = useObserver(() => props.selection.selectedItems.slice());
    if (selectedMapFeatures.length === 1 && selectedMapFeatures[0].entityType === 'DatasetVectoreFeature') {
        selectedFeature = selectedMapFeatures[0] as IDatasetVectorFeature;
    }

    if (!selectedFeature) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={'Select a feature to retrieve additional information'}
            />
        );
    }

    return (
        <div className='dataset-vector-feature-info'>
            {props.infoTemplate(selectedFeature)}
        </div>
    );

};
