import chroma from 'chroma-js';

import { IFeatureStyle } from '@oida/core';

import { Aoi } from '../models';

export const defaultAoiStyleGetter = (aoiInstance: Aoi): IFeatureStyle => {

    let color = chroma(aoiInstance.color);
    if (aoiInstance.selected) {
        color = color.alpha(0.3);
    } else {
        color = color.alpha(0.1);
    }

    return {
        point: {
            visible: aoiInstance.visible.value,
            radius: 5,
            fillColor: color.gl(),
            strokeColor: color.alpha(1).gl()
        },
        line: {
            visible: aoiInstance.visible.value,
            color: color.alpha(1).gl(),
            width: aoiInstance.hovered ? 3 : 2
        },
        polygon: {
            visible: aoiInstance.visible.value,
            fillColor: color.gl(),
            strokeColor: color.alpha(1).gl(),
            strokeWidth: aoiInstance.hovered ? 3 : 2
        }
    };
};
