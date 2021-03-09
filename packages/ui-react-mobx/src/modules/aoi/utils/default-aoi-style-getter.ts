import chroma from 'chroma-js';

import { IFeatureStyle } from '@oida/core';

import { Aoi } from '../models';

export const defaultAoiStyleGetter = (aoiInstance: Aoi): IFeatureStyle => {

    let color = chroma(aoiInstance.color);
    if (aoiInstance.selected.value) {
        color = color.alpha(0.3);
    } else {
        color = color.alpha(0.1);
    }

    const visible = aoiInstance.visible.value || aoiInstance.hovered.value || aoiInstance.selected.value;
    return {
        point: {
            visible: visible,
            radius: 5,
            fillColor: color.gl(),
            strokeColor: color.alpha(1).gl()
        },
        line: {
            visible: visible,
            color: color.alpha(1).gl(),
            width: aoiInstance.hovered.value ? 3 : 2
        },
        polygon: {
            visible: visible,
            fillColor: color.gl(),
            strokeColor: color.alpha(1).gl(),
            strokeWidth: aoiInstance.hovered.value ? 3 : 2
        }
    };
};
