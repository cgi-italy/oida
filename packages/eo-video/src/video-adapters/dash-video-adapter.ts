import { VideoAdapter, VideoStream, VideoAdapterEvents } from './video-adapter';

export type DashVideoAdapterConfig = {
    dashPlayer;
    videoElement: HTMLVideoElement;
};

export class DashVideoAdapter implements VideoAdapter {
    protected dashPlayer_;
    protected videoElement_: HTMLVideoElement;
    protected mode_: 'frame' | 'play';

    constructor(config: DashVideoAdapterConfig) {
        this.dashPlayer_ = config.dashPlayer;
        this.videoElement_ = config.videoElement;
        this.mode_ = 'frame';
    }

    setFrameMode(stream: VideoStream) {
        this.mode_ = 'frame';
        this.dashPlayer_.resetSettings();
        this.dashPlayer_.updateSettings({
            streaming: {
                abr: {
                    autoSwitchBitrate: {
                        video: false
                    }
                },
                reuseExistingSourceBuffers: false,
                flushBufferAtTrackSwitch: true,
                //stableBufferTime: 0.5,
                //bufferTimeAtTopQuality: 0.5,
                //bufferTimeAtTopQualityLongForm: 0.5,
                bufferToKeep: 0,
                bufferPruningInterval: 1
            }
        });

        this.dashPlayer_.setQualityFor('video', stream.id);
    }

    setPlayMode(stream: VideoStream) {
        this.mode_ = 'play';
        this.dashPlayer_.resetSettings();

        this.dashPlayer_.updateSettings({
            streaming: {
                abr: {
                    ABRStrategy: 'abrBola', // abrThroughput abrBola abrDynamic
                    autoSwitchBitrate: {
                        video: true
                    },
                    maxBitrate: {
                        video: stream.bitrate
                    },
                    initialBitrate: {
                        video: stream.bitrate
                    }
                },
                fastSwitchEnabled: true,
                reuseExistingSourceBuffers: false,
                flushBufferAtTrackSwitch: true,
                bufferToKeep: 0,
                jumpGaps: false,
                jumpLargeGaps: false
            }
        });
    }

    setPreferredStream(stream: VideoStream) {
        if (this.mode_ === 'play') {
            const currentMaxBitrate = this.dashPlayer_.getSettings().streaming.abr.maxBitrate.video;
            if (stream.bitrate !== currentMaxBitrate) {
                console.log(`Updating max stream quality from ${currentMaxBitrate} to ${stream.bitrate}`);
                this.dashPlayer_.updateSettings({
                    streaming: {
                        abr: {
                            maxBitrate: {
                                video: stream.bitrate
                            }
                        }
                    }
                });
                return true;
            }
        } else {
            const currentQuality = this.dashPlayer_.getQualityFor('video');
            if (stream.id !== currentQuality) {
                this.dashPlayer_.setQualityFor('video', stream.id);
                return true;
            }
        }
        return false;
    }

    getAvailableStreams() {
        const streams = this.dashPlayer_.getBitrateInfoListFor('video');
        return streams.map((stream, idx) => {
            return {
                id: idx,
                width: stream.width,
                height: stream.height,
                bitrate: stream.bitrate / 1000
            };
        });
    }

    seek(time: number) {
        this.dashPlayer_.seek(time);
    }

    bindToAdapterEvents(events: VideoAdapterEvents) {
        this.dashPlayer_.on('playbackSeeking', events.onSeeking);
        this.dashPlayer_.on('playbackSeeked', events.onSeeked);
        this.dashPlayer_.on('bufferLoaded', events.onSeeked);
        this.dashPlayer_.on('playbackPlaying', events.onPlaying);
        this.dashPlayer_.on('playbackWaiting', events.onWaiting);
        this.dashPlayer_.on('playbackStalled', events.onWaiting);
        this.dashPlayer_.on('bufferStalled', events.onWaiting);
        this.videoElement_.addEventListener('seeking', events.onSeeking);
        this.videoElement_.addEventListener('seeked', events.onSeeked);
        this.videoElement_.addEventListener('ended', events.onPlayEnd);
        this.videoElement_.addEventListener('pause', events.onPlayEnd);
    }
}

