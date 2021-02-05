export type VideoStream = {
    id: number | string;
    bitrate: number;
    width: number;
    height: number;
};

export type VideoAdapterEvents = {
    onSeeking: () => void;
    onSeeked: () => void;
    onPlaying: () => void;
    onWaiting: () => void;
    onPlayEnd: () => void;
};

export interface VideoAdapter {
    setFrameMode(stream?: VideoStream);
    setPlayMode(stream?: VideoStream);
    setPreferredStream(stream: VideoStream): boolean;
    seek(time: number);
    getAvailableStreams(): VideoStream[];
    bindToAdapterEvents(events: VideoAdapterEvents): void;
}
