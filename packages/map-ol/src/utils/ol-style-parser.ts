import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Circle from 'ol/style/Circle';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';

import { GeometryTypes, IFeatureStyle, IPointStyle, isIcon, ILineStyle, IPolygonStyle, ILabelStyle } from '@oidajs/core';

export type OLStyle = Style & { pickingDisabled?: boolean };
export class OLStyleParser {
    getStyleForGeometry(geometryType: GeometryTypes | 'LinearRing', style: IFeatureStyle): OLStyle | undefined {
        let olStyle: OLStyle | undefined;
        let pickingDisabled = false;
        if (style) {
            switch (geometryType) {
                case 'Point':
                case 'MultiPoint':
                    olStyle = this.getPointStyle_(style.point);
                    pickingDisabled = style.point?.pickingDisabled || false;
                    break;
                case 'LineString':
                case 'MultiLineString':
                    olStyle = this.getLineStyle_(style.line);
                    pickingDisabled = style.line?.pickingDisabled || false;
                    break;
                case 'Polygon':
                case 'MultiPolygon':
                case 'BBox':
                case 'Circle':
                    olStyle = this.getPolygonStyle_(style.polygon);
                    pickingDisabled = style.polygon?.pickingDisabled || false;
                    break;
            }
        }

        if (style.label && style.label.visible && olStyle) {
            this.setLabelStyle_(olStyle, style.label);
        }

        if (olStyle) {
            Object.defineProperty(olStyle, 'pickingDisabled', {
                value: pickingDisabled,
                writable: true
            });
        }

        return olStyle;
    }

    protected parseColor_(color) {
        const olColor = [Math.floor(color[0] * 255), Math.floor(color[1] * 255), Math.floor(color[2] * 255)];
        if (color.length === 4) {
            olColor[3] = color[3];
        }
        return olColor;
    }

    protected getPointStyle_(pointStyle: IPointStyle | undefined) {
        if (!pointStyle || !pointStyle.visible) {
            return undefined;
        }

        const style = new Style();

        if (isIcon(pointStyle)) {
            style.setImage(
                new Icon({
                    src: pointStyle.url,
                    color: pointStyle.color ? this.parseColor_(pointStyle.color) : undefined,
                    scale: pointStyle.scale,
                    declutterMode: 'none' // we want decluttering enabled only for labels
                })
            );
        } else {
            style.setImage(
                new Circle({
                    radius: pointStyle.radius || 8,
                    fill: pointStyle.fillColor ? new Fill({ color: this.parseColor_(pointStyle.fillColor) }) : undefined,
                    stroke: pointStyle.strokeColor ? new Stroke({ color: this.parseColor_(pointStyle.strokeColor) }) : undefined,
                    declutterMode: 'none' // we want decluttering enabled only for labels
                })
            );
        }

        if (pointStyle.zIndex !== undefined) {
            style.setZIndex(pointStyle.zIndex);
        }

        return style;
    }

    protected getLineStyle_(lineStyle: ILineStyle | undefined) {
        if (!lineStyle || !lineStyle.visible) {
            return undefined;
        }

        const style = new Style();

        style.setStroke(
            new Stroke({
                color: this.parseColor_(lineStyle.color),
                width: lineStyle.width
            })
        );

        if (lineStyle.zIndex !== undefined) {
            style.setZIndex(lineStyle.zIndex);
        }

        return style;
    }

    protected getPolygonStyle_(polygonStyle: IPolygonStyle | undefined) {
        if (!polygonStyle || !polygonStyle.visible) {
            return undefined;
        }

        const style = new Style();

        if (polygonStyle.fillColor) {
            style.setFill(new Fill({ color: this.parseColor_(polygonStyle.fillColor) }));
        }
        if (polygonStyle.strokeColor) {
            style.setStroke(
                new Stroke({
                    color: polygonStyle.strokeColor ? this.parseColor_(polygonStyle.strokeColor) : undefined,
                    width: polygonStyle.strokeWidth
                })
            );
        }

        if (polygonStyle.zIndex !== undefined) {
            style.setZIndex(polygonStyle.zIndex);
        }

        return style;
    }

    protected setLabelStyle_(style: OLStyle, labelStyle: ILabelStyle) {
        style.setText(
            new Text({
                text: labelStyle.text,
                fill: labelStyle.fillColor ? new Fill({ color: this.parseColor_(labelStyle.fillColor) }) : undefined,
                stroke: labelStyle.strokeColor
                    ? new Stroke({ width: labelStyle.strokeWidth ?? 1, color: this.parseColor_(labelStyle.strokeColor) })
                    : undefined,
                offsetX: labelStyle.offsetX,
                offsetY: labelStyle.offsetY,
                font: labelStyle.font,
                scale: labelStyle.scale
            })
        );
    }
}
