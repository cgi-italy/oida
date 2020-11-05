import { ColorMap, RasterBandMode, RasterBandModeSingle } from '@oida/eo-mobx';
import { plottyToAdamWcsColormap } from '../utils';

export const getColormapWcsParams = (bandMode: RasterBandMode) => {

    let colorRange: string | undefined = undefined;
    let colorTable: string | undefined = undefined;

    let colorMap: ColorMap | undefined;
    const bandModeValue = bandMode.value;
    if (bandModeValue instanceof RasterBandModeSingle) {
        colorMap = bandModeValue.colorMap;
        let mapRange = bandModeValue.colorMap.domain?.mapRange;
        if (mapRange) {
            colorRange = `(${mapRange.min},${mapRange.max})`;
        }
    }

    if (colorMap) {
        colorTable = plottyToAdamWcsColormap[colorMap.colorScale];
    }

    return {
        colorTable,
        colorRange
    };

};
