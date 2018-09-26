import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Circle from 'ol/style/Circle';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';

import { IFeatureStyle, IPointStyle, isIcon, ILineStyle, IPolygonStyle } from '@cgi-eo/map-core';

export class OLStyleParser {

    getStyleForGeometry(geometryType: GeoJSON.GeoJsonGeometryTypes, style: IFeatureStyle) {

        let olStyle: Style = null;

        switch (geometryType) {
            case 'Point':
            case 'MultiPoint':
                olStyle = this.getPointStyle_(style.point);
                break;
            case 'LineString':
            case 'MultiLineString':
                olStyle = this.getLineStyle_(style.line);
                break;
            case 'Polygon':
            case 'MultiPolygon':
                olStyle = this.getPolygonStyle_(style.polygon);
                break;
        }

        return olStyle;
    }

    protected parseColor_(color) {
        let olColor = [Math.floor(color[0] * 255), Math.floor(color[1] * 255), Math.floor(color[2] * 255)];
        if (color.length === 4) {
            olColor[3] = color[3];
        }
        return olColor;
    }

    protected getPointStyle_(pointStyle: IPointStyle) {

        if (!pointStyle.visible) {
            return null;
        }

        let style = new Style();

        if (isIcon(pointStyle)) {
            style.setImage(new Icon({
                src: pointStyle.url,
                color: pointStyle.color ? this.parseColor_(pointStyle.color) : undefined,
                scale: pointStyle.scale
            }));
        } else {
            style.setImage(new Circle({
                radius: pointStyle.radius,
                fill: pointStyle.fillColor ? new Fill({color: this.parseColor_(pointStyle.fillColor)}) : undefined,
                stroke: pointStyle.strokeColor ? new Stroke({color: this.parseColor_(pointStyle.strokeColor)}) : undefined
            }));
        }

        return style;
    }

    protected getLineStyle_(lineStyle: ILineStyle) {

        if (!lineStyle.visible) {
            return null;
        }

        let style = new Style();

        style.setStroke(new Stroke({
            color: this.parseColor_(lineStyle.color),
            width: lineStyle.width
        }));

        return style;
    }

    protected getPolygonStyle_(polygonStyle: IPolygonStyle) {

        if (!polygonStyle.visible) {
            return null;
        }

        let style = new Style();

        if (polygonStyle.fillColor) {
            style.setFill(new Fill({color: this.parseColor_(polygonStyle.fillColor)}));
        }
        if (polygonStyle.strokeColor) {
            style.setStroke(new Stroke({
                color: polygonStyle.strokeColor ? this.parseColor_(polygonStyle.strokeColor) : undefined,
                width: polygonStyle.strokeWidth
            }));
        }

        return style;
    }
}
