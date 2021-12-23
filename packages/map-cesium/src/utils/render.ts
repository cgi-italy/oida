import JulianDate from 'cesium/Source/Core/JulianDate';

const updateVisualizers = (dataSource, time) => {
    if (!time) {
        return true;
    }

    let pendingUpdate = false;

    const visualizers = dataSource._visualizers;

    if (visualizers) {
        visualizers.forEach((visualizer) => {
            pendingUpdate = pendingUpdate || !visualizer.update(time || JulianDate.now());
        });
    }

    return pendingUpdate;
};

export const updateDataSource = (dataSource, scene) => {
    const pendingUpdate = updateVisualizers(dataSource, scene.lastRenderTime);

    if (pendingUpdate) {
        const postRenderCallback = () => {
            const pendingUpdate = updateVisualizers(dataSource, scene.lastRenderTime);
            if (pendingUpdate) {
                scene.requestRender();
            } else {
                scene.postRender.removeEventListener(postRenderCallback);
            }
        };

        scene.postRender.addEventListener(postRenderCallback);
        if (scene.lastRenderTime) {
            setTimeout(() => scene.requestRender(), 20);
        }
    } else {
        scene.requestRender();
    }
};
