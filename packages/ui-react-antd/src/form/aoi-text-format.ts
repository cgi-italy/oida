import { geometry as geojsonGeometryParser } from '@turf/helpers';
import { wktToGeoJSON, geojsonToWKT } from '@terraformer/wkt';

import { AoiValue, BBox, GeometryTypes } from '@oidajs/core';

export type AoiTextFormat = {
    /** THe format unique id */
    id: string;
    /** A format friendly name */
    name: string;
    /** A function to format an aoi value to a string */
    formatter: (value: AoiValue) => string;
    /** A function that given a string returns an aoi value. It should throw on invalid string */
    parser: (value: string) => AoiValue;
    /** List of geometry types supported by the format. If omitted all types assumed  */
    geometryTypes?: Exclude<GeometryTypes, 'GeometryCollection' | 'GeometryCollectionEx'>[];
};

export const geoJsonAoiFormat: AoiTextFormat = {
    id: 'geojson',
    name: 'GeoJSON',
    formatter: (value) => {
        return JSON.stringify(value.geometry);
    },
    parser: (value) => {
        const parsedJson = JSON.parse(value);
        let geometry: Exclude<GeoJSON.Geometry, GeoJSON.GeometryCollection> | undefined;
        if (parsedJson.type === 'Feature' && parsedJson.geometry) {
            geometry = parsedJson.geometry;
        } else if (parsedJson.type && parsedJson.coordinates) {
            if (parsedJson.type === 'GeometryCollection') {
                throw new Error('Cannot use a geometry collection as AOI');
            }
            geometry = parsedJson;
        }
        if (geometry) {
            const geom = geojsonGeometryParser(geometry.type, geometry.coordinates);
            return {
                geometry: geom
            };
        } else {
            throw new Error('Invalid GeoJSON string');
        }
    },
    geometryTypes: ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon']
};

export const wktAoiFormat: AoiTextFormat = {
    id: 'wkt',
    name: 'WKT',
    formatter: (value) => {
        return geojsonToWKT(value.geometry);
    },
    parser: (value) => {
        const geometry = wktToGeoJSON(value);
        if (geometry.type === 'GeometryCollection') {
            throw new Error('Cannot use a geometry collection as AOI');
        }
        return {
            geometry: geometry
        };
    },
    geometryTypes: ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon']
};

export const bboxAoiFormat: AoiTextFormat = {
    id: 'bbox_corners',
    name: 'BBox corners',
    formatter: (value) => {
        if (value.geometry.type === 'BBox') {
            const bbox = value.geometry.bbox;
            return `${bbox[0]}, ${bbox[1]},\n${bbox[2]}, ${bbox[3]}`;
        } else {
            return '';
        }
    },
    parser: (value) => {
        let corners: BBox | undefined;
        try {
            // check for stringified JSON array
            const jsonArray = JSON.parse(value);
            if (Array.isArray(jsonArray) && jsonArray.length === 4 && jsonArray.every((item) => typeof item === 'number')) {
                corners = jsonArray as BBox;
            }
        } catch (e) {
            // not an array string
        }
        if (!corners) {
            // check for comma separated corners string
            const stringArray = value.replace(/\s+/g, '').split(',');
            if (stringArray.length === 4) {
                corners = stringArray.map((item) => parseFloat(item)) as BBox;
            }
        }
        if (!corners) {
            throw new Error('Invalid BBox string provider');
        }

        if (!corners.every((c) => Number.isFinite(c))) {
            throw new Error('Invalid bounding box coordinates');
        }
        if (
            corners[0] < -180 ||
            corners[1] < -90 ||
            corners[2] <= corners[0] ||
            corners[2] > 180 ||
            corners[3] <= corners[1] ||
            corners[3] > 90
        ) {
            throw new Error('Invalid bounding box coordinates');
        }
        return {
            geometry: {
                type: 'BBox',
                bbox: corners
            }
        };
    },
    geometryTypes: ['BBox']
};
