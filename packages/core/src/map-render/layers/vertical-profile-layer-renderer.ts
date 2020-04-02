import { Color } from './feature-layer-renderer';
import { ILayerRenderer } from './map-layer-renderer';

export type IVerticalProfile = {
    bottomCoords: GeoJSON.LineString,
    height: number | number[],
    topCoords?: GeoJSON.LineString,
    bottomHeight?: number | number[]
};

export type IVerticalProfileStyle = {
    visible: boolean,
    fillImage?: string,
    fillColor?: Color
};

export interface IVerticalProfileLayerRenderer extends ILayerRenderer {
    addProfile(id: string, profile: IVerticalProfile, style: IVerticalProfileStyle);
    getProfile(id: string);
    updateProfile(id: string, profile: IVerticalProfile);
    updateProfileStyle(id: string, style: IVerticalProfileStyle);
    removeProfile(id: string);
    removeAllProfiles();
}

export const VERTICAL_PROFILE_LAYER_ID = 'vertical_profile';
