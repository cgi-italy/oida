import React from 'react';

import { Slider } from 'antd';

import { MapLayer } from '@oida/state-mobx';
import { useSelector } from '@oida/ui-react-mobx';
import { DatasetViz } from '@oida/eo-mobx';


export type DatasetVizOpacityControlProps = {
    datasetViz: DatasetViz<MapLayer>;
};

export const DatasetVizOpacityControl = (props: DatasetVizOpacityControlProps) => {

    const mapLayer = props.datasetViz.mapLayer;

    let opacity = useSelector(() => {
        return mapLayer.opacity.value;
    });

    return (
        <div className='dataset-viz-opacity dataset-slider-selector'>
            <span>Opacity:</span>
            <Slider
                value={Math.round(opacity * 100)}
                onChange={(value) => mapLayer.opacity.setValue(value as number / 100)}
                tipFormatter={(value) => `${value}%`}
            />
        </div>
    );

};
