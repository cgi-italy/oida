import { action, makeObservable, reaction } from 'mobx';

import { SubscriptionTracker } from '@oida/core';

import { ComboAnalysis, ComboAnalysisProps } from './combo-analysis';
import { DatasetGridValues, DatasetGridValuesProps } from './dataset-grid-values';


export const GRID_SCATTER_ANALYSIS = 'grid_scatter_analysis';

export type GridScatterAnalysisProps = {
    xAnalysis?: DatasetGridValues | Omit<DatasetGridValuesProps, 'vizType'>;
    yAnalysis?: DatasetGridValues | Omit<DatasetGridValuesProps, 'vizType'>;
} & Omit<ComboAnalysisProps, 'type' | 'analyses'>;

/**
 * A combo analysis that extracts a grid of values for two or three different datasets
 * to enable scatter analyses
 */
export class GridScatterAnalysis extends ComboAnalysis<DatasetGridValues> {

    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: GridScatterAnalysisProps) {
        super({
            ...props,
            type: GRID_SCATTER_ANALYSIS
        });

        this.subscriptionTracker_ = new SubscriptionTracker();

        if (props.xAnalysis) {
            if (props.xAnalysis instanceof DatasetGridValues) {
                this.setXAnalysis(props.xAnalysis);
            } else {
                this.setXAnalysis(new DatasetGridValues(props.xAnalysis));
            }
        }
        if (props.yAnalysis) {
            if (props.yAnalysis instanceof DatasetGridValues) {
                this.setYAnalysis(props.yAnalysis);
            } else {
                this.setYAnalysis(new DatasetGridValues(props.yAnalysis));
            }
        }

        makeObservable(this);

        this.afterInit_();
    }

    get xAxisAnalysis() {
        return this.analyses.length ? this.analyses[0] : undefined;
    }

    get yAxisAnalysis() {
        return this.analyses.length > 1 ? this.analyses[1] : undefined;
    }

    get colorMapAnalysis() {
        return this.analyses.length > 2 ? this.analyses[2] : undefined;
    }

    get aoi() {
        return this.analyses.length ? this.analyses[0].aoi : undefined;
    }

    @action
    setXAnalysis(analysis: DatasetGridValues) {
        const aoi = this.aoi;
        analysis.visible.setValue(true);
        analysis.setAoi(aoi);

        if (this.analyses.length > 0) {
            this.parent_.removeAnalysis(this.analyses[0]);
        }
        this.analyses[0] = analysis;
        this.parent_.addAnalysis(analysis);
    }

    @action
    setYAnalysis(analysis: DatasetGridValues) {
        if (this.analyses.length > 1) {
            this.analyses[1]?.dispose();
        }
        this.analyses[1] = analysis;
        analysis.visible.setValue(false);
        analysis.setAoi(this.aoi ? {
            geometry: this.aoi.geometry.value
        } : undefined);
    }

    @action
    setColorMapAnalysis(analysis: DatasetGridValues) {
        if (this.analyses.length > 2) {
            this.analyses[2]?.dispose();
        }
        this.analyses[2] = analysis;
        analysis.visible.setValue(false);
        analysis.setAoi(this.aoi ? {
            geometry: this.aoi.geometry.value
        } : undefined);
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
    }

    addAnalysis() {
        throw new Error('GridScatterAnalysis: cannot invoke addAnalysis. Use setXAnalysis and setYAnalysis instead');
    }

    removeAnalysis() {
        throw new Error('GridScatterAnalysis: cannot invoke removeAnalysis');
    }

    protected afterInit_() {
        const aoiLinkDisposer = reaction(() => this.aoi?.geometry.value, (geometry) => {
            this.analyses.slice(1).forEach((analysis) => {
                analysis.setAoi(geometry ? {
                    geometry: geometry
                } : undefined);
            });
        });

        this.subscriptionTracker_.addSubscription(aoiLinkDisposer);
    }

}
