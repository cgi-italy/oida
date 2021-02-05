import { VideoAdapter, VideoStream, VideoAdapterEvents } from './video-adapter';

export type HtmlVideoAdapterConfig = {
    videoElement: HTMLVideoElement;
};

export class HtmlVideoAdapter implements VideoAdapter {
    protected videoElement_: HTMLVideoElement;

    constructor(config: HtmlVideoAdapterConfig) {
        this.videoElement_ = config.videoElement;
    }

    setFrameMode(stream?: VideoStream) {}

    setPlayMode(stream?: VideoStream) {}

    setPreferredStream(stream: VideoStream) {
        return false;
    }

    getAvailableStreams() {
        return [{
            id: 0,
            width: this.videoElement_.videoWidth,
            height: this.videoElement_.videoHeight,
            bitrate: -1
        }];
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

