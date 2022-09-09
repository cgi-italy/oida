import { Geometry, GeometryTypes } from '../common';

import { FormField, FormFieldDefinition, FormFieldRendererConfig } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const AOI_FIELD_ID = 'aoi';

export type AoiValue = {
    geometry: Geometry;
    props?: {
        id?: string;
        name?: string;
        fromMapViewport?: boolean;
    };
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
    type: GeometryTypes;
    constraints?: {
        maxCoords?: number;
    };
};

export type AoiFieldConfig<IMPORT_CONFIG = any, MAP_COMPONENT_TYPE = any> = {
    /** The list of actions to enable in the form field */
    supportedActions: AoiAction[];
    /** The list of geometries types to enable for the field*/
    supportedGeometries: AoiSupportedGeometry[];
    /** The callback to invoke when an action is selected */
    onActiveActionChange: (action: AoiAction) => void;
    /** The current active action */
    activeAction: AoiAction;
    name: string;
    /** The color to use to represent the current aoi value */
    color?: string;
    /** The current aoi state */
    state: {
        hovered: boolean;
        visible: boolean;
        selected: boolean;
    };
    /** The callback to invoke when the aoi is hovered */
    onHoverAction?: (hovered: boolean) => void;
    /** The callback to invoke when the aoi is selected */
    onSelectAction?: (selected: boolean) => void;
    /** The callback to invoke when the aoi visibility is changed */
    onVisibleAction?: (visible: boolean) => void;
    /** The callback to invoke when the center on map action is selected */
    onCenterAction?: () => void;
    /** The map import configuration */
    importConfig?: IMPORT_CONFIG;
    /** An optional map compnent to embed in the form control (e.g. for aoi display/drawing) */
    embeddedMapComponent?: MAP_COMPONENT_TYPE;
};

export type AoiFieldDefinition<IMPORT_CONFIG = any, MAP_COMPONENT_TYPE = any> = FormFieldDefinition<
    typeof AOI_FIELD_ID,
    AoiValue,
    AoiFieldConfig<IMPORT_CONFIG, MAP_COMPONENT_TYPE>
>;
export type AoiField<IMPORT_CONFIG = any, MAP_COMPONENT_TYPE = any> = FormField<
    typeof AOI_FIELD_ID,
    AoiValue,
    AoiFieldConfig<IMPORT_CONFIG, MAP_COMPONENT_TYPE>
>;

setFormFieldSerializer(AOI_FIELD_ID, {
    toString: (formField) => {
        return formField.value?.props?.name || formField.value?.geometry.type || 'unspecified';
    },
    toJSON: (value) => {
        return {
            geometry: value.geometry,
            props: {
                name: value.props?.name,
                fromMapViewport: value.props?.fromMapViewport
            }
        };
    }
});

export type AoiFieldFactoryProps = {
    name: string;
    title?: string;
    required?: boolean;
    readonly?: boolean;
    rendererConfig?: FormFieldRendererConfig;
    supportedActions: AoiAction[];
    supportedGeometries: AoiSupportedGeometry[];
    embedMap?: boolean;
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

declare module './form-field' {
    interface IFormFieldDefinitions {
        [AOI_FIELD_ID]: {
            type: typeof AOI_FIELD_ID;
        } & AoiFieldDefinition;
    }

    interface IFormFieldValueTypes {
        [AOI_FIELD_ID]: AoiValue;
    }
}
