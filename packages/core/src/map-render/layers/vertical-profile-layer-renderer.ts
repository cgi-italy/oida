import { Color } from './feature-layer-renderer';
import { IMapLayerRenderer, MapLayerRendererConfig } from './map-layer-renderer';

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

export type VerticalProfileCoordinate = {
    profileId: string;
    geographic?: GeoJSON.Position;
    unprojected?: GeoJSON.Position;
};

export type VerticalProfileLayerRendererConfig = MapLayerRendererConfig & {
    onCoordinateSelect?: (selected?: {profileId: string, coordinate: number[]}) => void;
    onCoordinateHover?: (hovered?: {profileId: string, coordinate: number[]}) => void;
};

export interface IVerticalProfileLayerRenderer extends IMapLayerRenderer {
    addProfile(id: string, profile: IVerticalProfile, style: IVerticalProfileStyle, data?: any);
    getProfile(id: string);
    updateProfile(id: string, profile: IVerticalProfile);
    updateProfileStyle(id: string, style: IVerticalProfileStyle);
    removeProfile(id: string);
    removeAllProfiles();
    setHighlightedCoordinate(coord: VerticalProfileCoordinate | undefined);
    setSelectedCoordinate(coord: VerticalProfileCoordinate | undefined);
    setHighlightedRegion(bbox: GeoJSON.BBox | undefined);
}

export const VERTICAL_PROFILE_LAYER_ID = 'vertical_profile';


declare module './map-layer-renderer' {
    export interface IMapLayerRendererConfigDefinitions {
        [VERTICAL_PROFILE_LAYER_ID]: VerticalProfileLayerRendererConfig;
    }
}
