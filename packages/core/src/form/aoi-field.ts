import { Geometry, GeometryTypes } from '../types/geometry';

import { FormField, FormFieldDefinition, FormFieldRendererConfig } from './form-field';
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

export type AoiSupportedGeometry = {
    type: GeometryTypes,
    constraints?: {
        maxCoords?: number
    }
};

export type AoiFieldConfig<IMPORT_CONFIG = any> = {
    supportedActions: AoiAction[];
    supportedGeometries: AoiSupportedGeometry[];
    onActiveActionChange: (action: AoiAction) => void;
    activeAction: AoiAction;
    name: string;
    color?: string;
    onHoverAction?: (hovered: boolean) => void;
    onSelectAction?: (selected: boolean) => void;
    importConfig?: IMPORT_CONFIG
};

export type AoiFieldDefinition<IMPORT_CONFIG = any> = FormFieldDefinition<typeof AOI_FIELD_ID, AoiValue, AoiFieldConfig<IMPORT_CONFIG>>;
export type AoiField<IMPORT_CONFIG = any> = FormField<typeof AOI_FIELD_ID, AoiValue, AoiFieldConfig<IMPORT_CONFIG>>;


setFormFieldSerializer(AOI_FIELD_ID, {
    toString: (formField) => {
        return `${formField.title}: ${formField.value.name}`;
    }
});


export type AoiFieldFactoryProps = {
    name: string;
    title?: string;
    required?: boolean;
    rendererConfig?: FormFieldRendererConfig;
    supportedActions: AoiAction[];
    supportedGeometries: AoiSupportedGeometry[];
};

export type AoiFieldFactory = (props: AoiFieldFactoryProps) => AoiFieldDefinition;

let aoiFieldFactory: AoiFieldFactory | undefined;

/**
 * Since AOI field definition is usually linked to the specific map implementation (e.g. aoi drawing,
 * aoi visualization on map) with this method it is possible to register a function that generates
 * an AOI field definition given some basic field properties
 * @param factory The AOI factory function
 */
export const setAoiFieldFactory = (factory: AoiFieldFactory) => {
    aoiFieldFactory = factory;
};

/**
 * Get the AOI factory registered with {@link setAoiFieldFactory}
 */
export const getAoiFieldFactory = () => {
    if (!aoiFieldFactory) {
        throw new Error('AoiFieldFactory: no factory defined');
    }
    return aoiFieldFactory;
};
