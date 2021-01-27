import { Map, LoadingStatus, GeoImageLayer } from '@oida/state-mobx';
import { observable, makeObservable, autorun, action } from 'mobx';
import { LoadingState, GeoImageLayerFootprint, getGeometryExtent } from '@oida/core';
import { createAdaptiveVideo } from './adaptive-video';


export type AdaptiveVideoLayerConfig = {
    id: string;
    videoSource: string;
    resolution?: number;
    footprints: GeoImageLayerFootprint[];
    mapState?: Map;
};

type AdaptiveStream = {
    quality: number;
    bitrate: number;
    resolution: number;
};

export class AdaptiveVideoLayer {

    @observable.ref isPlaying: boolean;
    @observable.ref ready: boolean;
    readonly mapLayer: GeoImageLayer;
    protected readonly map_: Map | undefined;

    protected mediaElement_;
    protected videoStreams_?: AdaptiveStream[];
    protected resolution_: number;
    protected footprints_: GeoImageLayerFootprint[];

    constructor(config: AdaptiveVideoLayerConfig) {

        this.map_ = config.mapState;
        this.mapLayer = new GeoImageLayer({
            id: config.id,
            config: {
                dynamicFootprint: true,
                srs: 'EPSG:4326'
            },
            footprint: config.footprints[0]
        });

        this.footprints_ = config.footprints;
        this.resolution_ = config.resolution || 0;
        this.videoStreams_ = undefined;

        this.ready = false;
        this.isPlaying = false;

        makeObservable(this);

        this.initVideoObject_(config.videoSource);
    }

    play() {
        if (!this.isPlaying) {
            this.setPlayMode_();
        }

        this.setPlayMode_();
    }

    stop() {
        if (this.isPlaying) {
            this.setFrameMode_();
        }
    }

    seek(time: number) {
        this.mediaElement_.currentTime = time;
    }

    seekByPercentage(percentage: number) {
        this.mediaElement_.currentTime = this.mediaElement_.duration * percentage;
    }

    get duration() {
        return this.mediaElement_.duration;
    }

    get extent() {
        return getGeometryExtent({
            type: 'Polygon',
            coordinates: [this.getFootprintForTime_(this.mediaElement_.currentTime)]
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

    protected initVideoObject_(videoSource: string) {

        this.mapLayer.loadingStatus.setValue(LoadingState.Loading);

        createAdaptiveVideo(videoSource).then(({media}) => {

            this.mediaElement_ = media;

            media.addEventListener('loadedmetadata', () => {

                this.mapLayer.setSource(media.renderer);
                this.mediaElement_.setMuted(true);

                const dashPlayer = media.dashPlayer;
                if (dashPlayer) {
                    const streams = dashPlayer.getBitrateInfoListFor('video');

                    const fullResWidth = streams[streams.length - 1].width;
                    if (!this.resolution_) {
                        this.resolution_ = this.getVideoResolutionInMeters_(fullResWidth);
                    }
                    this.videoStreams_ = streams.map((stream, idx) => {
                        return {
                            quality: idx,
                            resolution: fullResWidth / stream.width * this.resolution_,
                            bitrate: stream.bitrate / 1000
                        };
                    });

                    const map = this.map_;
                    if (map) {
                        autorun(() => {
                            const resolution = map.view.viewport.resolution;
                            this.onMapResolutionChange_(resolution);
                        }, {
                            delay: 1000
                        });
                    }
                } else {
                    if (!this.resolution_) {
                        this.resolution_ = this.getVideoResolutionInMeters_(media.renderer.videoWidth);
                    }
                }

                this.mediaElement_.addEventListener('waiting', (event) => {
                    this.mapLayer.loadingStatus.setValue(LoadingState.Loading);
                });

                this.mediaElement_.addEventListener('playing', (evt) => {
                    this.mapLayer.loadingStatus.setValue(LoadingState.Success);
                    this.mapLayer.forceRefresh();
                });

                this.mediaElement_.addEventListener('seeked', (evt) => {
                    this.mapLayer.loadingStatus.setValue(LoadingState.Success);
                    this.updateFootprintForCurrentTime_();
                    this.mapLayer.forceRefresh();
                });

                this.mediaElement_.addEventListener('seeking', (evt) => {
                    this.mapLayer.loadingStatus.setValue(LoadingState.Loading);
                });

                this.setReady_();
                this.setFrameMode_();

            }, {
                once: true
            });
        }).catch(() => {
            this.mapLayer.loadingStatus.setValue(LoadingState.Error);
        });
    }

    protected getQualityForResolution_(resolution: number) {

        const videoStreams = this.videoStreams_;
        if (!videoStreams) {
            return {
                bitrate: -1,
                quality: -1,
                resolution: this.resolution_
            };
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

        const dashPlayer = this.mediaElement_.dashPlayer;
        if (dashPlayer) {
            const initialBitrate = this.map_ ? this.getQualityForResolution_(this.map_.view.viewport.resolution).bitrate : -1;
            this.mediaElement_.dashPlayer.resetSettings();
            this.mediaElement_.dashPlayer.updateSettings({
                streaming: {
                    abr: {
                        ABRStrategy: 'abrBola', // abrThroughput abrBola abrDynamic
                        autoSwitchBitrate: {
                            video: true
                        },
                        maxBitrate: {
                            video: initialBitrate
                        },
                        initialBitrate: {
                            video: initialBitrate
                        }
                    },
                    fastSwitchEnabled: true
                }
            });
        }

        let lastFrameTs = -1;

        const updateTexture = () => {
            if (this.mediaElement_.currentTime !== lastFrameTs) {
                console.log(this.mediaElement_.currentTime);
                this.updateFootprintForCurrentTime_();
                this.mapLayer.forceRefresh();
                lastFrameTs = this.mediaElement_.currentTime;
            }
            if (this.isPlaying) {
                requestAnimationFrame(updateTexture);
            }
        };
        requestAnimationFrame(updateTexture);

        this.mediaElement_.play();
        this.setIsPlaying_(true);
    }

    protected setFrameMode_() {

        this.setIsPlaying_(false);
        this.mediaElement_.pause();

        const dashPlayer = this.mediaElement_.dashPlayer;
        if (dashPlayer) {
            this.mediaElement_.dashPlayer.resetSettings();
            dashPlayer.updateSettings({
                streaming: {
                    abr: {
                        autoSwitchBitrate: {
                            video: false
                        }
                    },
                    reuseExistingSourceBuffers: false,
                    flushBufferAtTrackSwitch: true,
                    stableBufferTime: 0.5,
                    bufferTimeAtTopQuality: 0.5,
                    bufferTimeAtTopQualityLongForm: 0.5,
                    bufferToKeep: 0
                }
            });

            let frameQuality = 0;
            if (this.map_) {
                frameQuality = this.getQualityForResolution_(this.map_.view.viewport.resolution).quality;
            } else if (this.videoStreams_) {
                frameQuality = this.videoStreams_.length - 1;
            }
            dashPlayer.setQualityFor('video', frameQuality);
            this.forceFrameReload_();

        }
    }

    protected onMapResolutionChange_(resolution: number) {

        const dashPlayer = this.mediaElement_.dashPlayer;

        if (dashPlayer) {
            const quality = this.getQualityForResolution_(resolution);

            if (this.isPlaying) {
                const currentMaxBitrate = dashPlayer.getSettings().streaming.abr.maxBitrate.video;
                if (quality.bitrate !== currentMaxBitrate) {
                    console.log(`Updating max stream quality from ${currentMaxBitrate} to ${quality.bitrate}`);
                    dashPlayer.updateSettings({
                        streaming: {
                            abr: {
                                maxBitrate: {
                                    video: quality.bitrate
                                }
                            }
                        }
                    });
                }
            } else {
                const currentQuality = dashPlayer.getQualityFor('video');
                if (quality.quality !== currentQuality) {
                    dashPlayer.setQualityFor('video', quality.quality);
                    this.forceFrameReload_();
                }
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
        this.ready = true;
    }

    @action
    protected setIsPlaying_(isPlaying: boolean) {
        this.isPlaying = isPlaying;
    }

    protected forceFrameReload_() {
        const currentTime = this.mediaElement_.currentTime;
        this.mediaElement_.currentTime = Number.MAX_VALUE;
        setImmediate(() => this.mediaElement_.currentTime = currentTime);
    }
}

