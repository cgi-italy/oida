import { toContext } from 'ol/render';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';

import { IPointStyle, ILineStyle, IPolygonStyle } from '@oida/core';
import { OLStyleParser } from '@oida/map-ol';

export type IconGeneratorConfig = {
    style: IPointStyle | ILineStyle | IPolygonStyle;
    geometryType?: 'Point' | 'Line' | 'Polygon';
    size?: {
        width: number;
        height: number;
    }
};

export class StyleIconGenerator {

    private canvas_: HTMLCanvasElement;
    private vectorContext_;
    private styleParser_: OLStyleParser;

    constructor() {
        const canvas = document.createElement('canvas');

        this.canvas_ = canvas;
        this.vectorContext_ = this.createVectorContext_(32, 32);
        this.styleParser_ = new OLStyleParser();
    }

    generateIcon(config: IconGeneratorConfig) {

        let drawConfig = {
            ...config,
            size: config.size || {
                width: 32,
                height: 32
            }
        };

        if ((drawConfig.size.width !== this.canvas_.width) || (drawConfig.size.height !== this.canvas_.height)) {
            this.vectorContext_ = this.createVectorContext_(drawConfig.size.width, drawConfig.size.height);
        }

        switch (drawConfig.geometryType) {
            case 'Line':
                return this.generateLineIcon_(drawConfig);
            case 'Polygon':
                return this.generatePolygonIcon_(drawConfig);
            default:
                return this.generatePointIcon_(drawConfig);
        }
    }

    private generatePointIcon_(config) {
        let olStyle = this.styleParser_.getStyleForGeometry('Point',  {
            point: {
                ...config.style,
                visible: true
            }
        });

        const drawPoint = () => {
            this.clearCanvas_();

            let {width, height} = config.size;

            let icon = olStyle.getImage();
            if (icon) {
                let imageSize = icon.getSize();
                icon.setScale(Math.min(width / imageSize[0], height / imageSize[1]));
            }

            this.vectorContext_.setStyle(olStyle);

            this.vectorContext_.drawGeometry(new Point([width / 2, height / 2]));
        };

        if (config.style.url) {

            olStyle.getImage().load();

            if (olStyle.getImage().getImageState() !== 2) {
                return new Promise<string>((resolve, reject) => {
                    olStyle.getImage().listenImageChange((change) => {
                        drawPoint();
                        return resolve(this.canvas_.toDataURL());
                    });
                });
            } else {
                drawPoint();
                return Promise.resolve(this.canvas_.toDataURL());
            }
        } else {
            drawPoint();
            return Promise.resolve(this.canvas_.toDataURL());
        }
    }

    private generateLineIcon_(config) {
        let olStyle = this.styleParser_.getStyleForGeometry('LineString',  {
            line: {
                ...config.style,
                visible: true
            }
        });

        let {width, height} = config.size;
        let coords = [
            [width * 0.1, height * 0.7],
            [width * 0.9, height * 0.3]
        ];

        this.clearCanvas_();

        this.vectorContext_.setStyle(olStyle);
        this.vectorContext_.drawGeometry(new LineString(coords));

        return Promise.resolve(this.canvas_.toDataURL());
    }

    private generatePolygonIcon_(config) {
        let olStyle = this.styleParser_.getStyleForGeometry('Polygon',  {
            polygon: {
                ...config.style,
                visible: true
            }
        });

        let {width, height} = config.size;
        let coords = [
            [width * 0.2, height * 0.1],
            [width * 0.7, height * 0.2],
            [width * 0.8, height * 0.9],
            [width * 0.1, height * 0.8]
        ];

        this.clearCanvas_();

        this.vectorContext_.setStyle(olStyle);
        this.vectorContext_.drawGeometry(new Polygon([coords]));

        return Promise.resolve(this.canvas_.toDataURL());
    }

    private clearCanvas_() {
        this.canvas_.getContext('2d')!.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
    }

    private createVectorContext_(width: number, height: number) {
        return toContext(this.canvas_.getContext('2d'), {size: [width, height]});
    }

}

const defaultIconGenerator = new StyleIconGenerator();

export const generateIconForStyle = (config: IconGeneratorConfig) => {
    return defaultIconGenerator.generateIcon(config);
};
