import chroma from 'chroma-js';

const getHashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
};

export const getColorFromString = (str: string, saturation: number, lightness: number) => {
    return chroma.hsl(
        getHashCode(str) % 360,
        saturation,
        lightness
    ).css();
};
