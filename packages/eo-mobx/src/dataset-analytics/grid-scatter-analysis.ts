import { action, makeObservable, reaction } from 'mobx';

import { SubscriptionTracker } from '@oida/core';

import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';
import { DatasetAreaValues, DatasetAreaValuesProps } from './dataset-area-values';


export const GRID_SCATTER_ANALYSIS = 'grid_scatter_analysis';

export type GridScatterAnalysisProps = {
    xAnalysis?: DatasetAreaValues | Omit<DatasetAreaValuesProps, 'vizType'>;
    yAnalysis?: DatasetAreaValues | Omit<DatasetAreaValuesProps, 'vizType'>;
} & Omit<DatasetAnalysisProps, 'type' | 'processings'>;

/**
 * A combo analysis that extracts a grid of values for two or three different datasets
 * to enable scatter analyses
 */
export class GridScatterAnalysis extends DatasetAnalysis<DatasetAreaValues> {

    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: GridScatterAnalysisProps) {
        super({
            ...props,
            type: GRID_SCATTER_ANALYSIS
        });

        this.subscriptionTracker_ = new SubscriptionTracker();

        if (props.xAnalysis) {
            if (props.xAnalysis instanceof DatasetAreaValues) {
                this.setXAnalysis(props.xAnalysis);
            } else {
                this.setXAnalysis(new DatasetAreaValues(props.xAnalysis));
            }
        }
        if (props.yAnalysis) {
            if (props.yAnalysis instanceof DatasetAreaValues) {
                this.setYAnalysis(props.yAnalysis);
            } else {
                this.setYAnalysis(new DatasetAreaValues(props.yAnalysis));
            }
        }

        makeObservable(this);

        this.afterInit_();
    }

    get xAxisAnalysis() {
        return this.processings.length ? this.processings[0] : undefined;
    }

    get yAxisAnalysis() {
        return this.processings.length > 1 ? this.processings[1] : undefined;
    }

    get colorMapAnalysis() {
        return this.processings.length > 2 ? this.processings[2] : undefined;
    }

    get aoi() {
        return this.processings.length ? this.processings[0].aoi : undefined;
    }

    @action
    setXAnalysis(processing: DatasetAreaValues) {
        const aoi = this.aoi;
        processing.visible.setValue(true);
        processing.setAoi(aoi);

        if (this.processings.length > 0) {
            this.processings[0].dispose();
        }
        this.processings[0] = processing;
    }

    @action
    setYAnalysis(analysis: DatasetAreaValues) {
        if (this.processings.length > 1) {
            this.processings[1].dispose();
        }
        this.processings[1] = analysis;
        analysis.visible.setValue(false);
        analysis.setAoi(this.aoi ? {
            geometry: this.aoi.geometry.value
        } : undefined);
    }

    @action
    setColorMapAnalysis(analysis: DatasetAreaValues) {
        if (this.processings.length > 2) {
            this.processings[2].dispose();
        }
        this.processings[2] = analysis;
        analysis.visible.setValue(false);
        analysis.setAoi(this.aoi ? {
            geometry: this.aoi.geometry.value
        } : undefined);
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
    }

    addProcessing() {
        throw new Error('GridScatterAnalysis: cannot invoke addProcessing directly. Use setXAnalysis and setYAnalysis instead');
    }

    removeProcessing() {
        throw new Error('GridScatterAnalysis: cannot invoke removeProcessing');
    }

    protected afterInit_() {
        const aoiLinkDisposer = reaction(() => this.aoi?.geometry.value, (geometry) => {
            this.processings.slice(1).forEach((processing) => {
                processing.setAoi(geometry ? {
                    geometry: geometry
                } : undefined);
            });
        });

        this.subscriptionTracker_.addSubscription(aoiLinkDisposer);
    }

}
