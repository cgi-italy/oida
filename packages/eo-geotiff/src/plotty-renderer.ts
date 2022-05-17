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
    /**
     * When the flipY option is true this canvas is used to flip the rendered image vertically
     */
    protected static flipCanvas_: [HTMLCanvasElement, CanvasRenderingContext2D] | undefined;

    protected static getDefaultPlottyInstance_() {
        if (!PlottyRenderer.defaultPlottyInstance_) {
            PlottyRenderer.defaultPlottyInstance_ = new plot({
                canvas: document.createElement('canvas'),
                useWebGL: true
            });
        }
        return PlottyRenderer.defaultPlottyInstance_;
    }

    protected static getFlipCanvas_(): [HTMLCanvasElement, CanvasRenderingContext2D] {
        if (!PlottyRenderer.flipCanvas_) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('PlottyRenderer: unable to create 2D canvas rendering context');
            }
            PlottyRenderer.flipCanvas_ = [canvas, ctx];
        }
        return PlottyRenderer.flipCanvas_;
    }

    protected plottyInstance_: plot;
    protected noDataValue_: number | undefined;
    protected colorScale_: string;
    protected domain_: number[];
    protected clamp_: boolean;
    protected flipY_: boolean;

    constructor(config: PlottyRendererConfig) {
        this.plottyInstance_ = config.plottyInstance || PlottyRenderer.getDefaultPlottyInstance_();
        this.noDataValue_ = this.plottyInstance_.noDataValue;
        this.colorScale_ = this.plottyInstance_.name;
        this.domain_ = this.plottyInstance_.domain;
        this.clamp_ = this.plottyInstance_.clampLow;
        this.flipY_ = false;
    }

    get canvas(): HTMLCanvasElement {
        return this.flipY_ ? PlottyRenderer.getFlipCanvas_()[0] : this.plottyInstance_.getCanvas();
    }

    get noDataValue() {
        return this.noDataValue_;
    }

    get colorScale() {
        return this.colorScale_;
    }

    get domain() {
        return this.domain_.slice();
    }

    get clamp() {
        return this.clamp_;
    }

    get flipY() {
        return this.flipY_;
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

    setFlipY(flipY: boolean) {
        this.flipY_ = flipY;
    }

    render(data: ArrayBuffer, width: number, height: number) {
        this.plottyInstance_.setData(data, width, height);
        this.plottyInstance_.setClamp(this.clamp_);
        this.plottyInstance_.setDomain(this.domain_);
        this.plottyInstance_.setColorScale(this.colorScale_);
        this.plottyInstance_.setNoDataValue(this.noDataValue_);
        this.plottyInstance_.render();
        if (this.flipY_) {
            const [canvas, ctx] = PlottyRenderer.getFlipCanvas_();
            canvas.width = width;
            canvas.height = height;
            ctx.save();
            ctx.scale(1, -1);
            ctx.drawImage(this.plottyInstance_.getCanvas(), 0, 0, width, -height);
            ctx.restore();
        }
        return this.canvas;
    }
}
