import { colorscales, renderColorScaleToCanvas } from 'plotty';
import { ColorScale, ColorScaleType } from '@oida/eo-mobx';
import chroma from 'chroma-js';

let plottyColorScales: (ColorScale & {
    colors: string[]
})[];

export const getPlottyColorScales = () => {

    if (!plottyColorScales) {
        let colorLegendCanvas = document.createElement('canvas');

        plottyColorScales = Object.keys(colorscales).map((id) => {

            renderColorScaleToCanvas(id, colorLegendCanvas);
            let legend = new Image();
            legend.src = colorLegendCanvas.toDataURL();


            const colorscale = colorscales[id];
            let colors = colorscale.colors;

            if (!colors) {
                colors = [];
                for (let i = 0; i < colorscale.length; i += 4) {
                    colors.push(chroma(Array.from(colorscale.slice(i, i + 3)) as number[]).hex());
                }
            }
            return {
                id: id,
                type: ColorScaleType.Parametric,
                name: id,
                legend: legend,
                colors: colors,
                positions: colorscale.positions
            };

        });
    }
    return plottyColorScales;
};

