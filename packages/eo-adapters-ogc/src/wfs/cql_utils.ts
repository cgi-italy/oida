import {
    AOI_FIELD_ID,
    BOOLEAN_FIELD_ID,
    DATE_FIELD_ID,
    DATE_RANGE_FIELD_ID,
    ENUM_FIELD_ID,
    getGeometryAsWkt,
    isQueryFilterOfType,
    NUMERIC_FIELD_ID,
    NUMERIC_RANGE_FIELD_ID,
    QueryFilter,
    STRING_FIELD_ID
} from '@oidajs/core';

export const getCqlClauseForQueryFilter = (filter: QueryFilter) => {
    if (filter.value === undefined || filter.value === null || filter.value === '') {
        return undefined;
    }
    if (isQueryFilterOfType(filter, BOOLEAN_FIELD_ID)) {
        return `${filter.key} = ${filter.value ? 'TRUE' : 'FALSE'}`;
    } else if (isQueryFilterOfType(filter, NUMERIC_FIELD_ID)) {
        return `${filter.key} = ${filter.value}`;
    } else if (isQueryFilterOfType(filter, NUMERIC_RANGE_FIELD_ID)) {
        if (typeof filter.value.from === 'number' && typeof filter.value.to === 'number') {
            return `${filter.key} BETWEEN ${filter.value.from} AND ${filter.value.to}`;
        } else if (typeof filter.value.from === 'number') {
            return `${filter.key} > ${filter.value.from}`;
        } else if (typeof filter.value.to === 'number') {
            return `${filter.key} > ${filter.value.to}`;
        } else {
            return undefined;
        }
    } else if (isQueryFilterOfType(filter, DATE_FIELD_ID)) {
        return `${filter.key} = ${filter.value.toISOString()}`;
    } else if (isQueryFilterOfType(filter, DATE_RANGE_FIELD_ID)) {
        return `${filter.key} BETWEEN '${filter.value.start.toISOString()}' AND '${filter.value.end.toISOString()}'`;
    } else if (isQueryFilterOfType(filter, ENUM_FIELD_ID)) {
        if (Array.isArray(filter.value)) {
            const escapedValue = filter.value.map((value) => `'${value}'`);
            return `${filter.key} IN (${escapedValue.join(',')})`;
        } else {
            return `${filter.key} = '${filter.value}'`;
        }
    } else if (isQueryFilterOfType(filter, STRING_FIELD_ID)) {
        return `strToLowerCase(${filter.key}) LIKE '%${filter.value.toLowerCase()}%`;
    } else if (isQueryFilterOfType(filter, AOI_FIELD_ID)) {
        if (filter.value.geometry.type === 'BBox') {
            return `BBOX(${filter.key}, ${filter.value.geometry.bbox.join(',')}`;
        } else if (filter.value.geometry.type === 'Circle') {
            return `DWITHIN(${filter.key}, POINT(${filter.value.geometry.center.join(' ')}), ${filter.value.geometry.radius}, 'meters')`;
        } else {
            return `INTERSECTS(${filter.key}, ${getGeometryAsWkt(filter.value.geometry)})`;
        }
    } else {
        throw new Error(`Unsuported query filter type ${filter.type}`);
    }
};

export const getCqlExpressionForQueryFilters = (filters: QueryFilter[]) => {
    return filters
        .filter((filter) => filter.value)
        .map((filter) => {
            return getCqlClauseForQueryFilter(filter);
        })
        .filter((filter) => filter !== undefined)
        .join(' AND ');
};
