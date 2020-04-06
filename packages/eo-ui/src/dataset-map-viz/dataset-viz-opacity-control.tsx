import React from 'react';

import { useObserver } from 'mobx-react';

import { Slider } from 'antd';

import { IDatasetViz } from '@oida/eo';

export type DatasetVizOpacityControlProps = {
    datasetViz: IDatasetViz;
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

    const mapLayer = props.datasetViz.mapLayer;

    if (!mapLayer) {
        return null;
    }

    return (
        <div className='dataset-viz-opacity dataset-slider-selector'>
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
