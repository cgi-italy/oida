export interface ITileSourceDefinitions {}

export type TileSourceTypes = keyof ITileSourceDefinitions;
export type TileSource<TYPE extends TileSourceTypes = TileSourceTypes> = ITileSourceDefinitions[TYPE];
