import 'mediaelement/standalone';
declare var MediaElement;

export const createAdaptiveVideo = (src: string | string[]) => {

    const sources = Array.isArray(src) ? src : [src];

    return new Promise<{media: typeof MediaElement, node: HTMLVideoElement, instance: any}>((resolve, reject) => {
        const parent = document.createElement('div');
        const video = document.createElement('video');
        video.preload = 'auto';
        parent.appendChild(video);

        let nextSourceIdx = 0;

        const loadNextSource = (error?) => {

            const nextSource = sources[nextSourceIdx++];
            if (!nextSource) {
                reject(error || 'Error loading video source');
            }
            video.src = nextSource;

            let player = new MediaElement(video, {
                success: (media, node, instance) => {

                    const onError = (error) => {
                        media.removeEventListener('error', onError);
                        media.destroy();
                        loadNextSource(error);
                    };

                    media.addEventListener('error', onError);

                    media.addEventListener('loadedmetadata', () => {
                        media.removeEventListener('error', onError);
                        resolve({media, node, instance});
                    }, {
                        once: true
                    });

                }
            });

        };

        loadNextSource();

    });
};

