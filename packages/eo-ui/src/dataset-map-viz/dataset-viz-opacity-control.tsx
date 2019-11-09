import React from 'react';

import { useObserver } from 'mobx-react-lite';

import { Slider } from 'antd';

import { IDatasetMapViz } from '@oida/eo';

export type DatasetVizOpacityControlProps = {
    datasetViz: IDatasetMapViz;
};

export const DatasetVizOpacityControl = (props: DatasetVizOpacityControlProps) => {

    let opacity = useObserver(() => {
        let mapLayer = props.datasetViz.mapLayer;
        if (mapLayer) {
            return mapLayer.opacity;
        } else {
            return 1;
        }
    });

    let mapLayer = props.datasetViz.mapLayer;

    return (
        <div className='dataset-viz-opacity'>
            <span>Opacity:</span>
            <Slider
                value={Math.round(opacity * 100)}
                onChange={(value) => mapLayer.setOpacity(value as number / 100)}
                tipFormatter={(value) => `${value}%`}
            >
            </Slider>
        </div>
    );

};
