import { Geometry, GeometryTypes } from '@oida/core';

import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const AOI_FIELD_ID = 'aoi';

export type AoiValue = {
    geometry: Geometry;
    props?: {
        id?: string;
        name?: string;
        fromMapViewport?: boolean;
    }
};

export enum AoiAction {
    None,
    DrawPoint,
    DrawLine,
    DrawBBox,
    DrawPolygon,
    LinkToMapViewport,
    Import
}


export type AoiFieldConfig<IMPORT_CONFIG = any> = {
    supportedActions: AoiAction[];
    supportedGeometries: Array<{
        type: GeometryTypes,
        constraints?: {
            maxCoords: number
        }
    }>;
    onActiveActionChange: (action: AoiAction) => void;
    activeAction: AoiAction;
    name: string;
    color?: string;
    onHoverAction?: (hovered: boolean) => void;
    onSelectAction?: (selected: boolean) => void;
    importConfig?: IMPORT_CONFIG
};

export type AoiField<IMPORT_CONFIG = any> = FormField<typeof AOI_FIELD_ID, AoiValue, AoiFieldConfig<IMPORT_CONFIG>>;


setFormFieldSerializer(AOI_FIELD_ID, {
    toString: (formField) => {
        return `${formField.title}: ${formField.value.name}`;
    }
});
