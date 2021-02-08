import { VideoAdapter, VideoStream, VideoAdapterEvents } from './video-adapter';

export type HlsVideoAdapterConfig = {
    hlsPlayer;
    videoElement: HTMLVideoElement;
};

export class HlsVideoAdapter implements VideoAdapter {
    protected hlsPlayer_;
    protected videoElement_: HTMLVideoElement;
    protected mode_: 'frame' | 'play';

    constructor(config: HlsVideoAdapterConfig) {
        this.hlsPlayer_ = config.hlsPlayer;
        this.videoElement_ = config.videoElement;
        this.mode_ = 'frame';
    }

    setFrameMode(stream: VideoStream) {
        this.mode_ = 'frame';
        this.hlsPlayer_.autoLevelCapping = -1;
        this.hlsPlayer_.currentLevel = stream.id;
    }

    setPlayMode(stream: VideoStream) {
        this.mode_ = 'play';
        this.hlsPlayer_.currentLevel = -1;
        this.hlsPlayer_.autoLevelCapping = stream.id;
    }

    setPreferredStream(stream: VideoStream) {
        if (this.mode_ === 'play') {
            if (this.hlsPlayer_.autoLevelCapping !== stream.id) {
                this.hlsPlayer_.autoLevelCapping = stream.id;
            }
        } else {
            if (this.hlsPlayer_.currentLevel !== stream.id) {
                this.hlsPlayer_.currentLevel = stream.id;
                return true;
            }
        }
        return false;
    }

    getAvailableStreams() {
        return this.hlsPlayer_.levels.map((level, idx) => {
            return {
                id: idx,
                width: level.width,
                height: level.height,
                bitrate: level.bitrate
            };
        });
    }

    seek(time: number) {
        this.videoElement_.currentTime = time;
    }

    bindToAdapterEvents(events: VideoAdapterEvents) {
        this.videoElement_.addEventListener('playing', events.onPlaying);
        this.videoElement_.addEventListener('stalled', events.onWaiting);
        this.videoElement_.addEventListener('waiting', events.onWaiting);
        this.videoElement_.addEventListener('seeking', events.onSeeking);
        this.videoElement_.addEventListener('seeked', events.onSeeked);
        this.videoElement_.addEventListener('ended', events.onPlayEnd);
        this.videoElement_.addEventListener('pause', events.onPlayEnd);
    }
}

