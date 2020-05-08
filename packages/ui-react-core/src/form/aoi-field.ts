import { Geometry, GeometryTypes } from '@oida/core';

import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';
import { DataCollectionProps } from '../data-collection';

export const AOI_FIELD_ID = 'aoi';

export type AoiValue = {
    geometry: Geometry;
    props?: {
        id?: string;
        name?: string;
        fromViewport?: boolean;
    }
};

export enum AoiAction {
    None,
    DrawPoint,
    DrawBBox,
    DrawPolygon,
    LinkToViewport
}

export type AoiImportConfig = {
    onFileImportAction?: (files) => Promise<void>;
    onAoiImportAction: (aoi) => void;
    onAoiCenterOnMapAction?: (aoi) => void;
    onImportCancel?: () => void;
    onSourceGroupSelect: (group: string) => void;
    selectedSourceGroup: string;
    sourceGroups: any[];
    selectedSourceGroupItems?: DataCollectionProps<any>;
    supportedFileTypes: string[]
};

export type AoiFieldConfig = {
    supportedGeometries: GeometryTypes[];
    onDrawPointAction?: () => void;
    onDrawBBoxAction?: () => void;
    onDrawPolygonAction?: () => void;
    onLinkToViewportAction?: () => void;
    aoiImport?: AoiImportConfig;
    activeAction: AoiAction;
    name: string;
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
