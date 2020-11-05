import React from 'react';

import { MapCoordQuantity } from '@oida/core';

import { ChoiceSelectorCombo } from '@oida/ui-react-antd';
import {
    useMapProjectionSelectorFromModule, useFormatSelector, useMapBaseLayerSelectorFromModule, useMapRendererSelectorFromModule
} from '@oida/ui-react-mobx';

export const Settings = () => {

    let baseLayerSelectorProps = useMapBaseLayerSelectorFromModule();
    let projSelectorProps = useMapProjectionSelectorFromModule();
    let rendererSelectorProps = useMapRendererSelectorFromModule();
    let formatSelectorProps = useFormatSelector(MapCoordQuantity);

    return (
        <React.Fragment>
            <ChoiceSelectorCombo {...baseLayerSelectorProps}/>
            <ChoiceSelectorCombo {...projSelectorProps}/>
            <ChoiceSelectorCombo {...rendererSelectorProps}/>
            <ChoiceSelectorCombo {...formatSelectorProps}/>
        </React.Fragment>
    );
};

