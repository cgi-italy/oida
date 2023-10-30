import chroma from 'chroma-js';

/**
 * Get the color, between black and white, with the highest contrast with the background color
 * @param backgroundColor the background color hex string
 * @returns the suggested text color (black or white)
 */
export const getTextColorForBackground = (backgroundColor: string) => {
    return chroma(backgroundColor).luminance() < 0.4 ? 'white' : 'black';
};
