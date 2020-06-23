import chroma from 'chroma-js';

import { IFeatureStyle, Geometry } from '@oida/core';
import { FeatureLayer, EntityGeometryGetter } from '@oida/state-mst';

import { IDataset } from '../../dataset';
import { IDatasetProductSearchViz } from '../dataset-product-search-viz';
import { IDatasetProduct } from '../dataset-product';

export type GeometrySearchResultsLayerConfig = {
    styleGetter?: (dataset: IDataset, item: IDatasetProduct) => IFeatureStyle;
    geometryGetter?: EntityGeometryGetter<IDatasetProduct>;
    productSearchViz: IDatasetProductSearchViz;
};

const defaultStyleGetter = (dataset: IDataset, item: IDatasetProduct) => {
    let color = chroma(dataset.config.color!);

    color = color.alpha(0.1);
    if (item.hovered) {
        color = color.brighten(1);
    }

    let zIndex = 0;

    if (item.selected) {
        zIndex = 5;
    }

    if (item.hovered) {
        zIndex = 10;
    }

    return {
        point: {
            rotation: 0,
            visible: item.visible,
            url: dataset.config.icon,
            color: color.alpha(1).gl(),
            zIndex: zIndex
        },
        line: {
            visible: item.visible,
            color: color.alpha(1).gl(),
            strokeWidth: 2,
            zIndex: zIndex
        },
        polygon: {
            visible: item.visible,
            fillColor: color.gl(),
            strokeColor: color.alpha(1).gl(),
            strokeWidth: 2,
            zIndex: zIndex
        }
    };
};

export const createGeometrySearchResultsLayer = (config: GeometrySearchResultsLayerConfig) => {

    return FeatureLayer.create({
        id: `${config.productSearchViz.dataset.id}Results`,
        source: config.productSearchViz.products.id,
        config: {
            geometryGetter: config.geometryGetter,
            styleGetter: (item: IDatasetProduct) => {
                return config.styleGetter
                ? config.styleGetter(config.productSearchViz.dataset, item)
                : defaultStyleGetter(config.productSearchViz.dataset, item);
            }
        }
    });
};
