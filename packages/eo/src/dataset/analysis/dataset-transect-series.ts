import { autorun } from 'mobx';
import { types, addDisposer, flow, Instance } from 'mobx-state-tree';

import length from '@turf/length';
import along from '@turf/along';
import nearestPointOnLine from '@turf/nearest-point-on-line';

import { LoadingState, Geometry } from '@oida/core';
import { hasConfig, hasAsyncData } from '@oida/state-mst';

import { DatasetViz } from '../dataset-viz';
import { DatasetVariable, DatasetDimension, DomainRange } from '../dataset-variable';

import { hasDimensions } from '../has-dimensions';

export const TRANSECT_SERIES_TYPE = 'transect_series';

export type DatasetTransectSeriesRequest = {
    variable: string;
    geometry: GeoJSON.LineString;
    dimensionValues?: Map<string, string | Date | number>;
};

export type DatasetTransectSeriesConfig = {
    variables: DatasetVariable<number>[];
    maxLineStringLength?: number;
    provider: (request: DatasetTransectSeriesRequest) => Promise<number[]>;
    dimensions: DatasetDimension<string | number | Date>[];
};

type TransectDimensionType = string | Date | number;

export type TransectSeriesItem = {
    value: number,
    distance: number,
    coordinates: GeoJSON.Position
};

const DatasetTransectSeriesDecl = DatasetViz.addModel(types.compose(
    TRANSECT_SERIES_TYPE,
    types.model({
        variable: types.maybe(types.string)
    }),
    hasDimensions,
    hasAsyncData,
    hasConfig<DatasetTransectSeriesConfig>()
).volatile((self) => ({
    data: [] as TransectSeriesItem[]
})).actions((self) => {

    const areAllDimensionsFilled = (dimensionValues: Map<string, TransectDimensionType>) => {
        return self.config.dimensions.every(dim => dimensionValues.has(dim.id));
    };

    return {
        updateData: flow(function*(params: Partial<DatasetTransectSeriesRequest>) {
            try {

                const { geometry, variable, dimensionValues } = params;

                if (geometry && variable && dimensionValues && areAllDimensionsFilled(dimensionValues)) {

                    const seriesData = yield self.retrieveData(() => self.config.provider({
                        geometry, variable, dimensionValues
                    }));

                    const line = {
                        type: 'Feature',
                        geometry: geometry,
                        properties: {}
                    } as GeoJSON.Feature<GeoJSON.LineString>;
                    const distance = length(line);

                    self.data = seriesData.map((item, idx) => {
                        const relativeDistance = idx / (seriesData.length - 1) * distance;
                        const coordinates = along(line, relativeDistance);
                        return {
                            value: item,
                            distance: idx / (seriesData.length - 1) * distance,
                            coordinates: coordinates.geometry.coordinates
                        };
                    });

                } else {
                    self.cancelDataRequest();
                    self.setLoadingState(LoadingState.Init);
                    self.data = [];
                }
            } catch (e) {
                self.data = [];
            }
        })
    };
}).actions((self) => {

    const getQueryParams = () => {
        return {
            geometry: (self as IDatasetTransectSeries).aoi?.geometry as (GeoJSON.LineString | undefined),
            variable: self.variable,
            dimensionValues: new Map(self.dimensionValues)
        };
    };

    return {
        setVariable: (variable: string | undefined) => {
            self.variable = variable;
        },
        setHighlightedPosition: (position: number | undefined) => {
            if (position !== undefined && position < self.data.length) {
                (self as IDatasetTransectSeries).aoi?.setHoveredPosition(self.data[position].coordinates);
            } else {
                (self as IDatasetTransectSeries).aoi?.setHoveredPosition(undefined);
            }
        },
        afterAttach: () => {

            self.setDebounceInterval(1000);
            let seriesUpdateDisposer = autorun(() => {
                self.updateData(getQueryParams());
            });

            addDisposer(self, () => {
                seriesUpdateDisposer();
            });
        }
    };
}).views((self) => {
    return {
        get highlightedPosition() {
            let aoi = (self as IDatasetTransectSeries).aoi;
            if (!aoi) {
                return undefined;
            }
            let hoveredPosition = aoi.hoveredPosition;
            if (!hoveredPosition) {
                return undefined;
            }

            let lineGeom = {
                type: 'LineString',
                coordinates: self.data.map((item) => item.coordinates)
            };
            let nearest = nearestPointOnLine(lineGeom, hoveredPosition);
            let nearestIdx = nearest.properties.index;
            if (nearestIdx < self.data.length - 1) {
                let distToPrev = Math.abs(self.data[nearestIdx].distance - nearest.properties.location);
                let distToNext = Math.abs(self.data[nearestIdx + 1].distance - nearest.properties.location);
                if (distToNext < distToPrev) {
                    nearestIdx = nearestIdx + 1;
                }
            }
            return nearestIdx;
        },
        get mapGeometry() : (Geometry | undefined) {
            let highlightedPosition = (self as IDatasetTransectSeries).highlightedPosition;
            if (highlightedPosition !== undefined) {
                return {
                    type: 'GeometryCollectionEx',
                    geometries: [(self as IDatasetTransectSeries).aoi!.geometry, {
                        type: 'Point',
                        coordinates: self.data[highlightedPosition].coordinates
                    }]
                };
            } else {
                return (self as IDatasetTransectSeries).aoi?.geometry;
            }
        }
    };
})
);

type DatasetTransectSeriesType = typeof DatasetTransectSeriesDecl;
export interface DatasetTransectSeriesInterface extends DatasetTransectSeriesType {}
export const DatasetTransectSeries: DatasetTransectSeriesInterface = DatasetTransectSeriesDecl;
export interface IDatasetTransectSeries extends Instance<DatasetTransectSeriesInterface> {}
