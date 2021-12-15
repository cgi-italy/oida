import { observable, makeObservable, autorun, action, reaction } from 'mobx';

import { LoadingState, GeoImageLayerFootprint, getGeometryExtent } from '@oidajs/core';
import { Map, GeoImageLayer } from '@oidajs/state-mobx';

import { createAdaptiveVideo } from './adaptive-video';
import { VideoAdapter, DashVideoAdapter, HlsVideoAdapter, HtmlVideoAdapter, VideoStream } from './video-adapters';

export type AdaptiveVideoLayerConfig = {
    id: string;
    videoSource: string | string[];
    resolution?: number;
    frameRate?: number;
    footprints: GeoImageLayerFootprint[];
    mapState?: Map;
    onTimeUpdate?: (time: number) => void;
};

type AdaptiveStream = VideoStream & {
    resolution: number;
};

export class AdaptiveVideoLayer {

    @observable.ref isPlaying: boolean;
    @observable.ref ready: boolean;
    readonly mapLayer: GeoImageLayer;
    protected readonly map_: Map | undefined;

    protected mediaElement_;
    protected videoAdapter_: VideoAdapter | undefined;
    protected videoStreams_?: AdaptiveStream[];
    protected resolution_: number;
    protected readonly frameDuration_: number;
    protected readonly footprints_: GeoImageLayerFootprint[];
    protected readonly timeUpdateCb_: ((time: number) => void) | undefined;

    constructor(config: AdaptiveVideoLayerConfig) {

        this.map_ = config.mapState;
        this.mapLayer = new GeoImageLayer({
            id: config.id,
            config: {
                dynamicFootprint: true,
                srs: 'EPSG:4326'
            },
            extent: getGeometryExtent({
                type: 'MultiLineString',
                coordinates: config.footprints
            }),
            footprint: config.footprints[0]
        });

        this.footprints_ = config.footprints;
        this.resolution_ = config.resolution || 0;
        this.frameDuration_ = 1 / (config.frameRate || 10);
        this.videoStreams_ = undefined;
        this.timeUpdateCb_ = config.onTimeUpdate;

        this.ready = false;
        this.isPlaying = false;

        makeObservable(this);

        this.initVideoObject_(config.videoSource);
    }

    play() {
        if (!this.isPlaying) {
            this.setPlayMode_();
        }
    }

    stop() {
        if (this.isPlaying) {
            this.mediaElement_.pause();
        }
    }

    get duration() {
        return this.mediaElement_.duration;
    }

    seek(time: number) {
        if (time >= this.mediaElement_.duration) {
            time = this.mediaElement_.duration - (this.frameDuration_ / 2);
        }
        if (time < 0) {
            time = 0;
        }
        if (Math.abs(time - this.mediaElement_.currentTime) > this.frameDuration_ / 2) {
            this.videoAdapter_?.seek(time);
        }
    }

    seekByPercentage(percentage: number) {
        this.seek(this.mediaElement_.duration * percentage);
    }

    stepForward() {
        this.seek(this.mediaElement_.currentTime + this.frameDuration_);
    }

    stepBackward() {
        this.seek(this.mediaElement_.currentTime - this.frameDuration_);
    }

    dispose() {
        if (this.mediaElement_) {
            document.body.removeChild(this.mediaElement_.renderer);
            this.mediaElement_.remove();
        }
    }

    get extent() {
        return getGeometryExtent({
            type: 'Polygon',
            coordinates: [this.mediaElement_ ? this.getFootprintForTime_(this.mediaElement_.currentTime) : this.footprints_[0]]
        });
    }

    protected getFootprintForTime_(time: number) {
        const percentage = time / this.mediaElement_.duration;
        let footprintIndex = Math.floor(percentage * this.footprints_.length);
        if (footprintIndex >= this.footprints_.length) {
            footprintIndex = this.footprints_.length - 1;
        }
        return this.footprints_[footprintIndex];
    }

    protected initVideoObject_(videoSource: string | string[]) {

        this.mapLayer.loadingStatus.setValue(LoadingState.Loading);

        createAdaptiveVideo(videoSource).then(({media}) => {

            this.mediaElement_ = media;
            this.mediaElement_.setMuted(true);

            // chrome has a lagging issue when HW acceleration is enabled and the video
            // is not visible on the screen. Append the video element to body and make it
            // 'almost' invisible
            this.appendVideoElementToBody_();

            if (media.dashPlayer) {
                this.videoAdapter_ = new DashVideoAdapter({
                    dashPlayer: media.dashPlayer,
                    videoElement: this.mediaElement_.renderer
                });
            } else if (media.hlsPlayer) {
                this.videoAdapter_ = new HlsVideoAdapter({
                    hlsPlayer: media.hlsPlayer,
                    videoElement: this.mediaElement_.renderer
                });
            } else {
                this.videoAdapter_ = new HtmlVideoAdapter({
                    videoElement: this.mediaElement_.renderer
                });
            }

            const streams = this.videoAdapter_.getAvailableStreams();

            const fullResWidth = streams[streams.length - 1].width;
            if (!this.resolution_) {
                this.resolution_ = this.getVideoResolutionInMeters_(fullResWidth);
            }
            this.videoStreams_ = streams.map((stream) => {
                return {
                    ...stream,
                    resolution: fullResWidth / stream.width * this.resolution_
                };
            });

            this.setFrameMode_();
            this.forceFrameReload_();

        }).catch(() => {
            this.mapLayer.loadingStatus.setValue(LoadingState.Error);
        });
    }

    protected getQualityForResolution_(resolution: number): AdaptiveStream | undefined {

        const videoStreams = this.videoStreams_;
        if (!videoStreams) {
            return undefined;
        }

        for (let i = 0; i < videoStreams.length; ++i) {
            if (videoStreams[i].resolution < resolution) {
                return videoStreams[i];
            }
        }

        return {
            ...videoStreams[videoStreams.length - 1],
            bitrate: -1
        };

    }

    protected setPlayMode_() {

        const preferredStream = this.map_ ? this.getQualityForResolution_(this.map_.view.viewport.resolution) : undefined;
        this.videoAdapter_?.setPlayMode(preferredStream);

        this.mediaElement_.play();
        this.setIsPlaying_(true);

        let lastFrameTime = -1;

        const updateTexture = () => {
            if (this.mediaElement_.currentTime - lastFrameTime > this.frameDuration_) {
                this.updateFootprintForCurrentTime_();
                this.mapLayer.forceRefresh();
                lastFrameTime = this.mediaElement_.currentTime;
                if (this.timeUpdateCb_) {
                    this.timeUpdateCb_(this.mediaElement_.currentTime);
                }
            }
            if (this.isPlaying) {
                requestAnimationFrame(updateTexture);
            }
        };
        updateTexture();


    }

    protected setFrameMode_() {

        this.setIsPlaying_(false);
        const preferredStream = this.map_
            ? this.getQualityForResolution_(this.map_.view.viewport.resolution)
            : this.videoStreams_ ? this.videoStreams_[this.videoStreams_.length - 1] : undefined;
        this.videoAdapter_?.setFrameMode(preferredStream);
        //this.forceFrameReload_();
    }

    protected onMapResolutionChange_(resolution: number) {
        const preferredStream = this.getQualityForResolution_(resolution);
        if (preferredStream) {
            const streamChanged = this.videoAdapter_?.setPreferredStream(preferredStream);
            if (streamChanged && !this.isPlaying) {
                this.forceFrameReload_();
            }
        }
    }

    protected getVideoResolutionInMeters_(videoWidth) {
        const extent = getGeometryExtent({
            type: 'Polygon',
            coordinates: [this.footprints_[0]]
        });

        return (extent![2] - extent![0]) * 111111 / videoWidth;
    }

    protected updateFootprintForCurrentTime_() {
        const footprint = this.getFootprintForTime_(this.mediaElement_.currentTime);
        if (footprint !== this.mapLayer.footprint) {
            this.mapLayer.setFootprint(footprint);
        }
    }

    @action
    protected setReady_() {
        this.videoAdapter_?.bindToAdapterEvents({
            onSeeking: () => {
                this.mapLayer.loadingStatus.update({
                    value: LoadingState.Loading,
                    percentage: 90
                });
            },
            onSeeked: this.onFrameSeeked_.bind(this),
            onPlaying: () => {
                this.mapLayer.loadingStatus.setValue(LoadingState.Success);
            },
            onWaiting: () => {
                if (this.isPlaying) {
                    this.mapLayer.loadingStatus.update({
                        value: LoadingState.Loading,
                        percentage: 70
                    });
                }
            },
            onPlayEnd: () => {
                this.setFrameMode_();
            }
        });

        const map = this.map_;
        if (map && this.videoStreams_?.length && this.videoStreams_.length > 1) {
            reaction(() => map.view.viewport.resolution, (resolution) => {
                this.onMapResolutionChange_(resolution);
            }, {
                delay: 1000
            });
        }

        this.ready = true;
    }

    @action
    protected setIsPlaying_(isPlaying: boolean) {
        this.isPlaying = isPlaying;
    }

    protected forceFrameReload_() {
        const currentTime = this.mediaElement_.currentTime;
        this.mediaElement_.currentTime = Number.MAX_VALUE;
        setTimeout(() => {
            this.mediaElement_.currentTime = currentTime;
            if (!this.ready) {

                const onFirstSeek = () => {
                    this.mapLayer.setSource(this.mediaElement_.renderer);
                    this.setReady_();
                    this.mediaElement_.removeEventListener('seeked', onFirstSeek);
                };

                this.mediaElement_.addEventListener('seeked', onFirstSeek);
            }
        }, 0);
    }

    protected onFrameSeeked_() {
        if (!this.isPlaying) {
            this.mapLayer.loadingStatus.setValue(LoadingState.Success);
            this.updateFootprintForCurrentTime_();
            this.mapLayer.forceRefresh();
            if (this.timeUpdateCb_) {
                this.timeUpdateCb_(this.mediaElement_.currentTime);
            }
        }
    }

    protected appendVideoElementToBody_() {
        const videoElement: HTMLVideoElement = this.mediaElement_.renderer;
        videoElement.style.position = 'absolute';
        videoElement.style.top = '0px';
        videoElement.style.right = '0px';
        videoElement.style.width = '1px';
        videoElement.style.zIndex = '1000';
        document.body.append(videoElement);
    }
}

