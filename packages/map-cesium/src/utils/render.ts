import JulianDate from 'cesium/Source/Core/JulianDate';

const updateVisualizers = (dataSource, time) => {

    if (!time) {
        return true;
    }

    let pendingUpdate = false;

    let visualizers = dataSource._visualizers;

    if (visualizers) {

        visualizers.forEach(visualizer => {
            pendingUpdate = pendingUpdate || !visualizer.update(time || JulianDate.now());
        });
    }

    return pendingUpdate;
};

export const updateDataSource = (dataSource, scene) => {

    let pendingUpdate = updateVisualizers(dataSource, scene.lastRenderTime);

    if (pendingUpdate) {
        let postRenderCallback = () => {
            let pendingUpdate = updateVisualizers(dataSource, scene.lastRenderTime);
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
