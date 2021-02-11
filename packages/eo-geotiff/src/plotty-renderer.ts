import { plot } from 'plotty';

export type PlottyRendererConfig = {
    plottyInstance?: plot;
};

export class PlottyRenderer {

    /**
     * Use the same plotty renderer instance for all loaders. Each plotty instance create a
     * new webGL context and we want to avoid the creation of multiple GL contexts.
     */
    protected static defaultPlottyInstance_: plot | undefined;
    protected static getDefaultPlottyInstance_() {
        if (!PlottyRenderer.defaultPlottyInstance_) {
            PlottyRenderer.defaultPlottyInstance_ = new plot({
                canvas: document.createElement('canvas'),
                //the webgl renderer is not currently able to handle NaN values. Disable it for now
                useWebGL: false
            });
        }
        return PlottyRenderer.defaultPlottyInstance_;
    }

    protected plottyInstance_: plot;
    protected noDataValue_: number | undefined;
    protected colorScale_: string;
    protected domain_: number[];
    protected clamp_: boolean;

    constructor(config: PlottyRendererConfig) {
        this.plottyInstance_ = config.plottyInstance || PlottyRenderer.getDefaultPlottyInstance_();
        this.noDataValue_ = this.plottyInstance_.noDataValue;
        this.colorScale_ = this.plottyInstance_.name;
        this.domain_ = this.plottyInstance_.domain;
        this.clamp_ = this.plottyInstance_.clampLow;
    }

    get canvas(): HTMLCanvasElement {
        return this.plottyInstance_.getCanvas();
    }

    setNoDataValue(noDataValue: number | undefined) {
        this.noDataValue_ = noDataValue;
    }

    setColorScale(colorScale: string) {
        this.colorScale_ = colorScale;
    }

    setDomain(domain: number[]) {
        this.domain_ = domain;
    }

    setClamp(clamp: boolean) {
        this.clamp_ = clamp;
    }

    render(data: ArrayBuffer, width: number, height: number) {
        this.plottyInstance_.setData(data, width, height);
        this.plottyInstance_.setClamp(this.clamp_);
        this.plottyInstance_.setDomain(this.domain_);
        this.plottyInstance_.setColorScale(this.colorScale_);
        this.plottyInstance_.setNoDataValue(this.noDataValue_);

        this.plottyInstance_.render();
        return this.canvas;
    }

}
