import { colorscales, renderColorScaleToCanvas } from 'plotty';
import { ColorScale, ColorScaleType } from '@oida/eo-mobx';

let plottyColorScales: ColorScale[];

export const getPlottyColorScales = () => {

    if (!plottyColorScales) {
        let colorLegendCanvas = document.createElement('canvas');

        plottyColorScales = Object.keys(colorscales).map((id) => {

            renderColorScaleToCanvas(id, colorLegendCanvas);
            let legend = new Image();
            legend.src = colorLegendCanvas.toDataURL();

            return {
                id: id,
                type: ColorScaleType.Parametric,
                name: id,
                legend: legend
            };
        });
    }
    return plottyColorScales;
};

