const updateVisualizers = (dataSource) => {
    let pendingUpdate = false;

    let visualizers = dataSource._visualizers;

    if (visualizers) {
        let time = new Date().getTime();

        visualizers.forEach(visualizer => {
            pendingUpdate = pendingUpdate || !visualizer.update(time);
        });
    }
    return pendingUpdate;
};

export const updateDataSource = (dataSource, scene) => {

    let pendingUpdate = updateVisualizers(dataSource);

    if (pendingUpdate) {
        let postRenderCallback = () => {
            let pendingUpdate = updateVisualizers(dataSource);
            if (pendingUpdate) {
                scene.requestRender();
            } else {
                scene.postRender.removeEventListener(postRenderCallback);
            }
        };

        scene.postRender.addEventListener(postRenderCallback);
        setTimeout(() => scene.requestRender(), 20);
    } else {
        scene.requestRender();
    }
};
