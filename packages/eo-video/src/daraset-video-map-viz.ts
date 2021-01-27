import { reaction, autorun } from 'mobx';

import { SubscriptionTracker, GeoImageLayerFootprint } from '@oida/core';
import { GeoImageLayer } from '@oida/state-mobx';

import { DatasetViz, DatasetVizProps } from '@oida/eo-mobx';
import { AdaptiveVideoLayer } from './adaptive-video-source';


export const VIDEO_VIZ_TYPE = 'video';

export type DatasetVideoMapVizConfig = {
    timeRange: {
        start: Date,
        end: Date
    };
    videoSource: string;
    footprints: GeoImageLayerFootprint[];
    frameRate?: number;
    resolution?: number;
    duration?: number;
};

export type DatasetVideoMapVizProps = {
    config: DatasetVideoMapVizConfig;
} & DatasetVizProps;

export class DatasetVideoMapViz extends DatasetViz<GeoImageLayer> {

    source!: AdaptiveVideoLayer;
    readonly config: DatasetVideoMapVizConfig;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: Omit<DatasetVideoMapVizProps, 'vizType'>) {
        super({
            ...props,
            vizType: VIDEO_VIZ_TYPE
        });

        this.config = props.config;

        this.subscriptionTracker_ = new SubscriptionTracker();

        this.afterInit_();

    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
    }

    protected initMapLayer_() {
        this.source = new AdaptiveVideoLayer({
            id: `${this.dataset.id}_video`,
            footprints: this.config.footprints,
            videoSource: this.config.videoSource
        });
        return this.source.mapLayer;
    }


    protected afterInit_() {

        const timeUpdateDisposer = autorun(() => {
            const selectedTime = this.dataset.selectedTime;
            if (!this.source.isPlaying) {
                let time = selectedTime instanceof Date ? selectedTime : selectedTime?.end;
                if (time) {
                    if (time < this.config.timeRange.start) {
                        time = this.config.timeRange.start;
                    }
                    if (time > this.config.timeRange.end) {
                        time = this.config.timeRange.end;
                    }
                    const percentage =
                        (time.getTime() - this.config.timeRange.start.getTime())
                        / (this.config.timeRange.end.getTime() - this.config.timeRange.start.getTime());

                    this.source.seekByPercentage(percentage);
                }
            }
        });

        this.subscriptionTracker_.addSubscription(timeUpdateDisposer);
    }
}

DatasetViz.register(VIDEO_VIZ_TYPE, DatasetVideoMapViz);
