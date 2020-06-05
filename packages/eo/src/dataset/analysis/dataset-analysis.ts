import { types, Instance, isValidReference, getParentOfType, addDisposer } from 'mobx-state-tree';
import { autorun } from 'mobx';

import chroma from 'chroma-js';

import { Geometry, IFeatureStyle } from '@oida/core';
import { Entity, createEntityCollectionType, FeatureLayer, hasStyleAsGetter, ReferenceOrType } from '@oida/state-mst';

import { DatasetViz } from '../dataset-viz';

let analysisStyleGetter = (analysis): IFeatureStyle => {

    let color = chroma(analysis.color);
    if (analysis.selected) {
        color = color.alpha(0.3);
    } else {
        color = color.alpha(0.1);
    }

    let zIndex = 0;
    if (analysis.selected) {
        zIndex = 1;
    }
    if (analysis.hovered) {
        zIndex = 2;
    }

    return {
        point: {
            visible: analysis.visible,
            url: 'assets/images/placeholder.png',
            scale: 0.5,
            color: color.alpha(1).gl(),
            zIndex: zIndex
        },
        line: {
            visible: analysis.visible,
            color: color.gl(),
            width: analysis.hovered ? 3 : 2,
            zIndex: zIndex
        },
        polygon: {
            visible: analysis.visible,
            fillColor: color.gl(),
            strokeColor: color.alpha(1).gl(),
            strokeWidth: analysis.hovered ? 3 : 2,
            zIndex: zIndex
        }
    };
};

let colorPalette = [
    '#78d747',
    '#0153e4',
    '#7bd68e',
    '#7436b9',
    '#648b37',
    '#d154ca',
    '#805b33',
    '#857cce',
    '#d58d3f',
    '#6e99bd',
    '#d14a40',
    '#81cec3',
    '#76303b',
    '#cdc094',
    '#37323d',
    '#ca4a86',
    '#446447',
    '#502d6d',
    '#cfd04b',
    '#cc97af'
];

let nextColorIdx = 0;
let getAnalysisColor = () => {
    let color = colorPalette[nextColorIdx];
    nextColorIdx = (nextColorIdx + 1) % colorPalette.length;
    return color;
};

const DatasetAnalysisDecl = Entity.addModel(types.compose(
    'datasetAnalysis',
    types.model({
        datasetViz: ReferenceOrType(DatasetViz.Type),
        geometry: types.maybe(types.frozen<Geometry>()),
        defaultColor: types.optional(types.string, getAnalysisColor),
        destroyOnClose: types.optional(types.boolean, true)
    }).actions(self => ({
        setGeometry: (geometry: Geometry | undefined) => {
            self.geometry = geometry;
            //TODO: fix this
            // @ts-ignore
            if (self.datasetViz.setGeometry) {
                // @ts-ignore
                self.datasetViz.setGeometry(geometry);
            }
        },
        afterAttach: () => {
            let referenceCheckDisposer = autorun(() => {
                if (!isValidReference(() => self.datasetViz) || !isValidReference(() => self.datasetViz.dataset)) {
                    let analyses = getParentOfType(self, DatasetAnalyses);
                    if (analyses) {
                        analyses.collection.remove(self);
                    }
                }
            });

            addDisposer(self, referenceCheckDisposer);
        }
    })).views((self: any) => {
        return {
            get color() {
                let color = self.defaultColor;
                if ( self.selected) {
                    color = '#FFFF00';
                } else if (self.hovered) {
                    color = chroma(color).brighten(1).hex();
                }
                return color;
            }
        };
    }),
    hasStyleAsGetter(analysisStyleGetter)
));

type DatasetAnalysisType = typeof DatasetAnalysisDecl;
export interface DatasetAnalysisInterface extends DatasetAnalysisType {}
export const DatasetAnalysis: DatasetAnalysisInterface = DatasetAnalysisDecl;
export interface IDatasetAnalysis extends Instance<DatasetAnalysisInterface> {}


const DatasetAnalysesDecl = types.model('DatasetAnalyses', {
    collection: createEntityCollectionType(DatasetAnalysis),
    geometryLayer: types.maybe(FeatureLayer),
    active: types.optional(types.boolean, false)
}).actions(self => ({
    setActive: (active: boolean) => {
        self.active = active;
    },
    afterAttach: () => {
        self.geometryLayer = FeatureLayer.create({
            id: 'analysisGeometries',
            source: self.collection.id
        });
    }
}));

type DatasetAnalysesType = typeof DatasetAnalysesDecl;
export interface DatasetAnalysesInterface extends DatasetAnalysesType {}
export const DatasetAnalyses: DatasetAnalysesInterface = DatasetAnalysesDecl;
export interface IDatasetAnalyses extends Instance<DatasetAnalysesInterface> {}
