import { toContext } from 'ol/render.js';
import { Point } from 'ol/geom.js';
import IconStyle from 'ol/style/Icon';
import ImageState from 'ol/ImageState';

import { IPointStyle } from '@oidajs/core';

import { OLStyleParser } from './ol-style-parser';

const styleParser = new OLStyleParser();

const canvas = document.createElement('canvas');

const getIconData = (iconStyle: IconStyle, width: number, height: number) => {
    const imageSize = iconStyle.getImage().getSize();
    const wScale = width / imageSize[0];
    const hScale = height / imageSize[1];

    iconStyle.getImage().setScale(Math.min(wScale, hScale));

    const vectorContext = toContext(canvas.getContext('2d'), { size: [width, height] });

    vectorContext.setStyle(iconStyle);
    vectorContext.drawGeometry(new Point([width / 2, height / 2]));

    return canvas.toDataURL();
};

/**
 * Generate an image given a feature point style configuration
 * @param style The point feature style
 * @param config Optional width and height of the generated image
 * @returns A promise with the icon data uri string
 */
export const generateIconForStyle = (style: IPointStyle, config?: { width?: number; height?: number }): Promise<string> => {
    const width = config?.width || 32;
    const height = config?.height || 32;

    const iconStyle: IconStyle = styleParser.getStyleForGeometry('Point', { point: style });

    iconStyle.getImage().load();

    if (iconStyle.getImage().getImageState() !== ImageState.LOADED) {
        return new Promise((resolve, reject) => {
            iconStyle.getImage().listenImageChange((change) => {
                if (iconStyle.getImage().getImageState() === ImageState.LOADED) {
                    resolve(getIconData(iconStyle, width, height));
                } else {
                    reject(new Error('generateIconForStyle: Unable to load icon image'));
                }
            });
        });
    } else {
        return Promise.resolve(getIconData(iconStyle, width, height));
    }
};
