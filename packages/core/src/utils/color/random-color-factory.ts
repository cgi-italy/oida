import chroma from 'chroma-js';

export type RandomColorFactoryProps = {
    startIdx?: number;
    saturationRange: number[];
    luminanceRange: number[];
};

export const randomColorFactory = (props?: RandomColorFactoryProps) => {
    let nextColorIdx = props?.startIdx || 0;
    const saturationRange = props?.saturationRange || [0.5, 1.0];
    const luminanceRange = props?.luminanceRange || [0.4, 0.6];
    const saturationSpan = saturationRange[1] - saturationRange[0];
    const luminanceSpan = luminanceRange[1] - luminanceRange[0];

    return () => {
        const hue = (nextColorIdx++ * 137.508) % 360; // use golden angle approximation
        return chroma
            .hsl(hue, saturationRange[0] + Math.random() * saturationSpan, luminanceRange[0] + Math.random() * luminanceSpan)
            .css();
    };
};
