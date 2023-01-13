import { JulianDate, Scene, DataSource, Visualizer } from 'cesium';

const updateVisualizers = (dataSource: DataSource, time: JulianDate) => {
    if (!time) {
        return true;
    }

    let pendingUpdate = false;

    // @ts-ignore: need access to private member
    const visualizers: Visualizer[] = dataSource._visualizers;

    if (visualizers) {
        visualizers.forEach((visualizer) => {
            pendingUpdate = pendingUpdate || !visualizer.update(time || JulianDate.now());
        });
    }

    return pendingUpdate;
};

export const updateDataSource = (dataSource: DataSource, scene: Scene) => {
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
