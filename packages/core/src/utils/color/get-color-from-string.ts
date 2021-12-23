import chroma from 'chroma-js';

// taken from https://github.com/darkskyapp/string-hash/blob/master/index.js
const getHashCode = (str) => {
    let hash = 5381,
        i = str.length;
    while (i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }

    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
     * integers. Since we want the results to be always positive, convert the
     * signed int to an unsigned by doing an unsigned bitshift. */
    return hash >>> 0;
};

export const getColorFromString = (str: string, saturation: number, lightness: number) => {
    return chroma.hsl(getHashCode(str) % 360, saturation, lightness).css();
};
