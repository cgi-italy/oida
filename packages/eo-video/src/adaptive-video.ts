import 'mediaelement/standalone';
declare var MediaElement;

export const createAdaptiveVideo = (src: string) => {
    return new Promise<{media: typeof MediaElement, node: HTMLVideoElement, instance: any}>((resolve, reject) => {
        const parent = document.createElement('div');
        const video = document.createElement('video');
        video.preload = 'auto';
        parent.appendChild(video);
        video.src = src;
        const player = new MediaElement(video, {
            success: (media, node, instance) => {
                resolve({media, node, instance});
            }
        });
    });
};

