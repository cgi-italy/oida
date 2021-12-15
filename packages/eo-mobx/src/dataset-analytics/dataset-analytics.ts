import { IObservableArray, observable, action, makeObservable, ObservableMap } from 'mobx';
import chroma from 'chroma-js';

import { IFeatureStyle } from '@oidajs/core';
import { ArrayTracker, FeatureLayer, FeatureStyleGetter } from '@oidajs/state-mobx';

import { DatasetAnalysis } from './dataset-analysis';
import { DatasetProcessing } from './dataset-processing';

import { analysisPlaceHolderIcon } from './analysis-placeholder-icon';

const defaultAnalysisStyleGetter = (processing: DatasetProcessing<any>): IFeatureStyle | IFeatureStyle[] => {

    if (processing.style) {
        return processing.style;
    }

    let color = chroma(processing.color);
    if (processing.selected.value) {
        color = color.alpha(0.3);
    } else {
        color = color.alpha(0.1);
    }

    let zIndex = 0;
    if (processing.selected.value) {
        zIndex = 1;
    }
    if (processing.hovered.value) {
        zIndex = 2;
    }

    return {
        point: {
            visible: processing.visible.value,
            url: analysisPlaceHolderIcon,
            scale: 0.5,
            color: color.alpha(1).gl(),
            zIndex: zIndex
        },
        line: {
            visible: processing.visible.value,
            color: color.alpha(1).gl(),
            width: processing.hovered.value ? 3 : 2,
            zIndex: zIndex
        },
        polygon: {
            visible: processing.visible.value,
            fillColor: color.gl(),
            strokeColor: color.alpha(1).gl(),
            strokeWidth: processing.hovered ? 3 : 2,
            zIndex: zIndex
        }
    };
};

export type DatasetAnalyticsProps = {
    analysisGeometryStyle?: FeatureStyleGetter<DatasetProcessing<any>>
    active?: boolean;
};

export class DatasetAnalytics {

    @observable.ref active: boolean;
    geometryLayer: FeatureLayer<DatasetProcessing<any>>;
    analyses: ObservableMap<string, DatasetAnalysis>;
    /**
     * Contains references to the combo analyses items. This array is used as source
     * for the analyses geometry layer
     */
    protected items_: IObservableArray<DatasetProcessing<any>>;
    protected analysisTrackers_: Map<string, ArrayTracker<DatasetProcessing<any>, DatasetProcessing<any>>>;

    constructor(props?: DatasetAnalyticsProps) {

        this.active = props?.active || false;

        this.items_ = observable.array([], {
            deep: false
        });

        this.analyses = observable.map([], {
            deep: false
        });

        this.geometryLayer = new FeatureLayer({
            id: 'analysis-geometry',
            source: this.items_,
            config: {
                geometryGetter: (processing => processing.geometry),
                styleGetter: props?.analysisGeometryStyle || defaultAnalysisStyleGetter,
                onFeatureHover: (feature, coord) => {
                    feature.onGeometryHover(coord);
                }
            }
        });

        this.analysisTrackers_ = new Map();

        makeObservable(this);
    }

    @action
    setActive(active: boolean) {
        this.active = active;
    }

    @action
    addAnalysis(analysis: DatasetAnalysis) {
        if (!this.analyses.has(analysis.id)) {
            this.analyses.set(analysis.id, analysis);
            // add all associated processing to the items array for geometry map visualization
            const tracker = new ArrayTracker({
                items: analysis.processings,
                idGetter: item => item.id,
                onItemAdd: (item) => {
                    this.items_.push(item);
                    return item;
                },
                onItemRemove: (item: DatasetProcessing<any>) => {
                    this.items_.remove(item);
                }
            });

            this.analysisTrackers_.set(analysis.id, tracker);

        }
    }

    @action
    removeAnalysis(analysis: DatasetAnalysis) {
        const tracker = this.analysisTrackers_.get(analysis.id);
        if (tracker) {
            tracker.destroy();
        }
        this.analyses.delete(analysis.id);
        analysis.dispose();
    }

}
