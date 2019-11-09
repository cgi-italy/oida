import { Geometry } from '@oida/core';

import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const AOI_FIELD_ID = 'aoi';

export type AoiValue = {
    name: string;
    geometry: Geometry;
    props?: {[x: string]: any}
};

export enum AoiAction {
    None,
    DrawBBox,
    DrawPolygon,
    LinkToViewport
}

export type AoiFieldConfig = {
    onDrawBBoxAction?: () => void;
    onDrawPolygonAction?: () => void;
    onLinkToViewportAction?: () => void;
    activeAction: AoiAction;
    color?: string;
    onHoverAction?: (hovered: boolean) => void;
    onSelectAction?: (selected: boolean) => void;
};

export type AoiField = FormField<typeof AOI_FIELD_ID, AoiValue, AoiFieldConfig>;


setFormFieldSerializer(AOI_FIELD_ID, {
    toString: (formField) => {
        return `${formField.title}: ${formField.value.name}`;
    }
});
