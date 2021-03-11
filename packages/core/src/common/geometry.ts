export interface BBoxGeometry  {
    type: 'BBox';
    bbox: GeoJSON.BBox;
}

export interface CircleGeometry {
    type: 'Circle';
    center: GeoJSON.Position;
    radius: number;
}


export type Geometry =  GeoJSON.Geometry | BBoxGeometry | CircleGeometry | GeometryCollection;

export type IndexableGeometry = Geometry & {
    id?: string
};

export interface GeometryCollection {
    type: 'GeometryCollectionEx';
    geometries: IndexableGeometry[];
}

export type GeometryTypes = Geometry['type'];
