import { autorun } from 'mobx';

import { SubscriptionTracker, GeoImageLayerFootprint } from '@oida/core';
import { GeoImageLayer } from '@oida/state-mobx';
import { getMapModule } from '@oida/ui-react-mobx';
import { DatasetViz, DatasetVizProps } from '@oida/eo-mobx';

import { AdaptiveVideoLayer } from './adaptive-video-source';


export const VIDEO_VIZ_TYPE = 'video';

export type DatasetVideoMapVizConfig = {
    timeRange: {
        start: Date,
        end: Date
    };
    videoSource: string | string[];
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
        this.source.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    protected initMapLayer_(props: DatasetVideoMapVizProps) {

        const mapState = getMapModule().map;

        this.source = new AdaptiveVideoLayer({
            id: `${this.id}_video`,
            footprints: props.config.footprints,
            videoSource: props.config.videoSource,
            frameRate: props.config.frameRate,
            mapState: mapState,
            onTimeUpdate: (time) => {
                const dt = this.getDateFromFrameTime_(time);
                this.dataset.setSelectedDate(dt);
            }
        });
        return this.source.mapLayer;
    }


    protected afterInit_() {

        const timeUpdateDisposer = autorun(() => {
            if (this.source.ready) {
                const selectedTime = this.dataset.selectedTime;
                if (!this.source.isPlaying) {
                    let time = selectedTime instanceof Date ? selectedTime : selectedTime?.end;
                    if (time) {
                        this.source.seekByPercentage(this.getVideoPercentageFromDate_(time));
                    }
                }
            }
        });

        this.subscriptionTracker_.addSubscription(timeUpdateDisposer);
    }

    protected getDateFromFrameTime_(time) {
        const perdentage = time / this.source.duration;
        const duration = this.config.duration
        ? this.config.duration * 1000
        : this.config.timeRange.end.getTime() - this.config.timeRange.start.getTime();

        let dt = new Date(this.config.timeRange.start.getTime() + duration * perdentage);

        if (this.config.frameRate) {
            const frameDuration = 1000 / this.config.frameRate;
            const distance = dt.getTime() - this.config.timeRange.start.getTime();
            dt = new Date(this.config.timeRange.start.getTime() + frameDuration * Math.floor(distance / frameDuration));
        }
        return dt;
    }

    protected getVideoPercentageFromDate_(dt: Date) {
        if (dt < this.config.timeRange.start) {
            dt = this.config.timeRange.start;
        }
        if (dt > this.config.timeRange.end) {
            dt = this.config.timeRange.end;
        }

        const duration = this.config.duration
            ? this.config.duration * 1000
            : this.config.timeRange.end.getTime() - this.config.timeRange.start.getTime();

        let relativeTime = dt.getTime() - this.config.timeRange.start.getTime();

        if (this.config.frameRate) {
            relativeTime += (1000 / this.config.frameRate) * 0.5;
        }

        const percentage = relativeTime / duration;

        return percentage;
    }
}

DatasetViz.register(VIDEO_VIZ_TYPE, DatasetVideoMapViz);
