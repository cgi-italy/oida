import { IObservableArray, observable, action, makeObservable, ObservableMap } from 'mobx';
import chroma from 'chroma-js';

import { IFeatureStyle } from '@oidajs/core';
import { ArrayTracker, FeatureLayer, FeatureStyleGetter, GroupLayer } from '@oidajs/state-mobx';

import { DatasetAnalysis } from './dataset-analysis';
import { DatasetProcessing } from './dataset-processing';

import { analysisPlaceHolderIcon } from './analysis-placeholder-icon';

const defaultAnalysisStyleGetter = (processing: DatasetProcessing<string, any>): IFeatureStyle | IFeatureStyle[] => {
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
    analysisGeometryStyle?: FeatureStyleGetter<DatasetProcessing<string, any>>;
    active?: boolean;
};

export class DatasetAnalytics {
    @observable.ref active: boolean;
    geometryLayer: FeatureLayer<DatasetProcessing<string, any>>;
    processingsLayer: GroupLayer;
    analyses: ObservableMap<string, DatasetAnalysis>;
    /**
     * Contains references to the combo analyses items. This array is used as source
     * for the analyses geometry layer
     */
    protected items_: IObservableArray<DatasetProcessing<string, any>>;
    protected analysisTrackers_: Map<string, ArrayTracker<DatasetProcessing<string, any>, DatasetProcessing<string, any>>>;

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
                geometryGetter: (processing) => processing.geometry,
                styleGetter: props?.analysisGeometryStyle || defaultAnalysisStyleGetter,
                onFeatureHover: (feature, coord) => {
                    feature.onGeometryHover(coord);
                }
            }
        });

        this.processingsLayer = new GroupLayer({
            id: 'analysis-layers'
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
                idGetter: (item) => item.id,
                onItemAdd: (item) => {
                    this.items_.push(item);
                    if (item.mapLayer) {
                        this.processingsLayer.children.add(item.mapLayer);
                    }
                    return item;
                },
                onItemRemove: (item: DatasetProcessing<string, any>) => {
                    this.items_.remove(item);
                    if (item.mapLayer) {
                        this.processingsLayer.children.remove(item.mapLayer);
                    }
                    // automatically remove the analysis if empty
                    if (analysis.destroyOnClose) {
                        setTimeout(() => {
                            if (!analysis.processings.length) {
                                this.removeAnalysis(analysis);
                            }
                        }, 0);
                    }
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

    getSnapshot() {
        return {
            analyses: Array.from(this.analyses.values()).map((analysis) => {
                return analysis.getSnapshot();
            })
        };
    }
}
