import {
    AOI_FIELD_ID,
    BOOLEAN_FIELD_ID,
    DATE_FIELD_ID,
    DATE_RANGE_FIELD_ID,
    ENUM_FIELD_ID,
    flipGeometryCoords,
    isQueryFilterOfType,
    NUMERIC_FIELD_ID,
    NUMERIC_RANGE_FIELD_ID,
    QueryFilter,
    STRING_FIELD_ID
} from '@oidajs/core';

export const getFesFilterClauseForQueryFilter = (filter: QueryFilter) => {
    if (isQueryFilterOfType(filter, BOOLEAN_FIELD_ID)) {
        return `<fes:PropertyIsEqualTo>
            <fes:ValueReference>${filter.key}</fes:ValueReference>
            <fes:Literal>${filter.value ? 'true' : 'false'}</fes:Literal>
        </fes:PropertyIsEqualTo>`;
    } else if (isQueryFilterOfType(filter, NUMERIC_FIELD_ID)) {
        return `<fes:PropertyIsEqualTo>
            <fes:ValueReference>${filter.key}</fes:ValueReference>
            <fes:Literal>${filter.value}</fes:Literal>
        </fes:PropertyIsEqualTo>`;
    } else if (isQueryFilterOfType(filter, NUMERIC_RANGE_FIELD_ID)) {
        return `<fes:PropertyIsBetween>
            <fes:ValueReference>${filter.key}</fes:ValueReference>
            <fes:LowerBoundary>
                <fes:Literal>${filter.value.from}</fes:Literal>
            </fes:LowerBoundary>
            <fes:UpperBoundary>
                <fes:Literal>${filter.value.to}</fes:Literal>
            </fes:UpperBoundary>
        </fes:PropertyIsBetween>`;
    } else if (isQueryFilterOfType(filter, DATE_FIELD_ID)) {
        return `<fes:PropertyIsEqualTo>
            <fes:ValueReference>${filter.key}</fes:ValueReference>
            <fes:Literal>${filter.value.toISOString()}</fes:Literal>
        </fes:PropertyIsEqualTo>`;
    } else if (isQueryFilterOfType(filter, DATE_RANGE_FIELD_ID)) {
        // TODO: we should use the dateParse function when the date is stored as string in the server. E.g.
        // <fes:Function name="dateParse">
        //    <fes:Literal>yyyy/MM/dd HH:mm:ss.SSS</fes:Literal>
        //    <fes:ValueReference>${filter.key}</fes:ValueReference>
        // </fes:Function>
        // NB: the string format should use the java notation.
        // Check here https://github.com/MadMG/moment-jdateformatparser for a translator from moment to java format
        return `<fes:PropertyIsBetween>
            <fes:ValueReference>${filter.key}</fes:ValueReference>
            <fes:LowerBoundary>
                <fes:Literal>${filter.value.start.toISOString()}</fes:Literal>
            </fes:LowerBoundary>
            <fes:UpperBoundary>
                <fes:Literal>${filter.value.end.toISOString()}</fes:Literal>
            </fes:UpperBoundary>
        </fes:PropertyIsBetween>`;
    } else if (isQueryFilterOfType(filter, ENUM_FIELD_ID)) {
        if (Array.isArray(filter.value)) {
            const escapedValue = filter.value.map((value) => `'${value}'`);
            return `${filter.key} IN (${escapedValue.join(',')})`;
        } else {
            return `<fes:PropertyIsEqualTo>
                <fes:ValueReference>${filter.key}</fes:ValueReference>
                <fes:Literal>${filter.value}</fes:Literal>
            </fes:PropertyIsEqualTo>`;
        }
    } else if (isQueryFilterOfType(filter, STRING_FIELD_ID)) {
        return `<fes:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!">
            <fes:ValueReference>${filter.key}</fes:ValueReference>
            <fes:Literal>*${filter.value}*</fes:Literal>
        </fes:PropertyIsLike>`;
    } else if (isQueryFilterOfType(filter, AOI_FIELD_ID)) {
        const flippedGeometry = flipGeometryCoords(filter.value.geometry);
        if (flippedGeometry.type === 'BBox') {
            return `<fes:BBOX>
                <fes:ValueReference>${filter.key}</fes:ValueReference>
                <gml:Envelope srsName="urn:x-ogc:def:crs:EPSG:4326">
                    <gml:lowerCorner>${flippedGeometry.bbox.slice(0, 2).join(' ')}</gml:lowerCorner>
                    <gml:upperCorner>${flippedGeometry.bbox.slice(2).join(' ')}</gml:upperCorner>
                </gml:Envelope>
            </fes:BBOX>`;
        } else if (flippedGeometry.type === 'Polygon') {
            return `<fes:Intersects>
                <fes:ValueReference>${filter.key}</fes:ValueReference>
                <gml:Polygon srsName="urn:x-ogc:def:crs:EPSG:4326">
                    <gml:exterior>
                        <gml:LinearRing>
                            <gml:posList>
                                ${flippedGeometry.coordinates[0].map((coord) => coord.join(' ')).join(' ')}
                            </gml:posList>
                        </gml:LinearRing>
                    </gml:exterior>
                </gml:Polygon>
            </fes:Intersects>`;
        } else if (filter.value.geometry.type === 'Circle') {
            return `<fes:DWithin>
                <fes:ValueReference>${filter.key}</fes:ValueReference>
                <gml:Point srsName="urn:x-ogc:def:crs:EPSG:4326">
                    <gml:pos>${filter.value.geometry.center.join(' ')}</gml:pos>
                </gml:Point>
                <fes:Distance>${filter.value.geometry.radius}</fes:Distance>
            </fes:DWithin>`;
        } else {
            throw new Error(`Filter for geometry of type ${filter.value.geometry.type} not implemented yet`);
        }
    } else {
        throw new Error(`Unsuported query filter type ${filter.type}`);
    }
};

export const getFesFilterExpressionForQueryFilters = (filters: QueryFilter[]) => {
    const serializedFilters = filters
        .filter((filter) => filter.value)
        .map((filter) => {
            return `${getFesFilterClauseForQueryFilter(filter)}`;
        })
        .join('');

    return `<fes:Filter xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2">
        <fes:And>${serializedFilters}</fes:And>
    </fes:Filter>`;
};
