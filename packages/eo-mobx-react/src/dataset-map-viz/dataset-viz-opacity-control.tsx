import React from 'react';

import { Slider } from 'antd';

import { MapLayer } from '@oidajs/state-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetViz } from '@oidajs/eo-mobx';

export type DatasetVizOpacityControlProps = {
    datasetViz: DatasetViz<MapLayer>;
};

export const DatasetVizOpacityControl = (props: DatasetVizOpacityControlProps) => {
    const mapLayer = props.datasetViz.mapLayer;

    const opacity = useSelector(() => {
        return mapLayer.opacity.value;
    });

    return (
        <div className='dataset-viz-opacity dataset-slider-selector'>
            <span>Opacity:</span>
            <Slider
                value={Math.round(opacity * 100)}
                onChange={(value) => mapLayer.opacity.setValue((value as number) / 100)}
                tipFormatter={(value) => `${value}%`}
            />
        </div>
    );
};
