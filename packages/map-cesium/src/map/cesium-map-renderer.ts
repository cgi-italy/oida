import CesiumWidget from  'cesium/Source/Widgets/CesiumWidget/CesiumWidget';
import SceneMode from 'cesium/Source/Scene/SceneMode';
import MapMode2D from 'cesium/Source/Scene/MapMode2D';

import BoundingSphere from 'cesium/Source/Core/BoundingSphere';
import Cartesian2 from 'cesium/Source/Core/Cartesian2';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Cartographic from 'cesium/Source/Core/Cartographic';
import CesiumMath from 'cesium/Source/Core/Math';

import Ray from 'cesium/Source/Core/Ray';
import IntersectionTests from 'cesium/Source/Core/IntersectionTests';
import Plane from 'cesium/Source/Core/Plane';

import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';

import 'cesium/Source/Widgets/CesiumWidget/CesiumWidget.css';

import { mapRendererFactory, IMapRenderer, IMapRendererProps, IMapViewport, IMapProjection, Size, MapCoord } from '@oida/core';

import { cesiumLayersFactory } from '../layers/cesium-layers-factory';
import { cesiumInteractionsFactory } from '../interactions/cesium-interactions-factory';
import { CesiumGroupLayer } from '../layers/cesium-group-layer';
import { getProjectionFromSRS } from '../utils/projection';


export const CESIUM_RENDERER_ID = 'cesium';

export class CesiumMapRenderer implements IMapRenderer {

    private viewer_: CesiumWidget;
    private layerGroup_: CesiumGroupLayer;

    constructor(props: IMapRendererProps) {
        this.initRenderer_(props);
    }

    setTarget(target: HTMLElement) {

        let parent = this.viewer_.container.parentNode;
        if (parent) {
            parent.removeChild(this.viewer_.container);
        }
        if (target) {
            target.appendChild(this.viewer_.container);
            if (this.viewer_.pendingViewport_) {
                this.viewer_.resize();
                this.viewer_.camera.setView(this.getViewFromProps_(this.viewer_.pendingViewport_));
                delete this.viewer_.pendingViewport_;
            }
        }
    }


    setViewport(viewport: IMapViewport) {
        this.viewer_.camera.setView(
            this.getViewFromProps_(viewport)
        );
    }

    setLayerGroup(group: CesiumGroupLayer) {
        this.layerGroup_ = group;
        this.viewer_.scene.primitives.add(group.getPrimitives());
        this.refreshImageries();
    }

    getLayersFactory() {
        return cesiumLayersFactory;
    }

    getInteractionsFactory() {
        return cesiumInteractionsFactory;
    }

    getViewer() {
        return this.viewer_;
    }

    getSize() {
        let canvas: HTMLCanvasElement = this.viewer_.canvas;
        return <Size>[canvas.clientWidth, canvas.clientHeight];
    }

    refreshImageries() {

        if (!this.layerGroup_) {
            return;
        }
        let rootCollection = this.layerGroup_.getImageries()._layers;

        let reduceFunction = (imageries, item) => {
            if (item instanceof ImageryLayer) {
                return [...imageries, item];
            } else {
                return item._layers.reduce(reduceFunction, imageries);
            }
        };

        let imageries = rootCollection.reduce(reduceFunction, []);

        this.viewer_.imageryLayers.removeAll(false);

        imageries.forEach((item) => {
            this.viewer_.imageryLayers.add(item);
        });
    }


    destroy() {
        let parent = this.viewer_.container.parentNode;
        if (parent) {
            parent.removeChild(this.viewer_.container);
        }
        this.viewer_.imageryLayers.removeAll(false);
        this.viewer_.scene.primitives.remove(this.layerGroup_.getPrimitives());
        this.viewer_.destroy();
    }

    protected initRenderer_(props: IMapRendererProps) {

        let container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';


        if (props.target) {
            props.target.appendChild(container);
        }

        let mapProjection = getProjectionFromSRS(props.projection.code, true);

        this.viewer_ = new CesiumWidget(container, {
            imageryProvider: false,
            sceneMode: this.getSceneMode_(props),
            mapProjection: mapProjection,
            requestRenderMode : true,
            mapMode2D: props.projection.wrapX ? MapMode2D.INFINITE_SCROLL : MapMode2D.ROTATE
        });

        this.viewer_.scene.primitives.destroyPrimitives = false;

        if (props.target) {
            this.viewer_.camera.setView(this.getViewFromProps_(props.viewport));
        } else {
            this.viewer_.pendingViewport_ = props.viewport;
        }


        if (props.onViewUpdating) {

            let duringMove = (evt) => {
                props.onViewUpdating(this.computeCurrentView_());
            };

            this.viewer_.camera.moveStart.addEventListener((evt) => {
                if (this.viewer_.scene.mode === SceneMode.MORPHING) {
                    return;
                }
                props.onViewUpdating();
                this.viewer_.scene.postRender.addEventListener(duringMove);
            });

            this.viewer_.camera.moveEnd.addEventListener((evt) => {
                if (this.viewer_.scene.mode === SceneMode.MORPHING) {
                    return;
                }
                this.viewer_.scene.postRender.removeEventListener(duringMove);
                props.onViewUpdated(this.computeCurrentView_());
            });

        }

    }

    protected getSceneMode_(props) {
        if (props.sceneMode === 'columbus') {
            return SceneMode.COLUMBUS_VIEW;
        } else if (props.sceneMode === '2D') {
            return SceneMode.SCENE2D;
        } else {
            return SceneMode.SCENE3D;
        }
    }

    protected computeCurrentView_() {

        let camera = this.viewer_.camera;
        let scene = this.viewer_.scene;

        if (scene.mode === SceneMode.COLUMBUS_VIEW) {

            let distance = camera.position.z / Math.cos(Math.PI / 2 + camera.pitch);

            let ray = new Ray(camera.position, camera.direction);
            let intersection = IntersectionTests.rayPlane(ray, Plane.ORIGIN_XY_PLANE);

            let center;

            if (intersection) {
                center = camera._projection.unproject(intersection);
            } else {
                center = camera.positionCartographic;
            }

            let pixelSize = new Cartesian2();
            camera.frustum.getPixelDimensions(
                scene.drawingBufferWidth,
                scene.drawingBufferHeight,
                distance,
                pixelSize
            );

            let resolution = Math.max(pixelSize.x, pixelSize.y);

            return {
                center: <Size>[CesiumMath.toDegrees(center.longitude), CesiumMath.toDegrees(center.latitude)],
                resolution,
                rotation: CesiumMath.toDegrees(camera.heading),
                pitch: 90 + CesiumMath.toDegrees(camera.pitch)
            };
        }

        let center = camera.pickEllipsoid(
            new Cartesian2(scene.drawingBufferWidth / 2, scene.drawingBufferHeight / 2 ),
            scene.globe.ellipsoid
        );
        if (center) {
            let distance = Cartesian3.distance(camera.positionWC, center);
            let pixelSize = new Cartesian2();
            camera.frustum.getPixelDimensions(
                scene.drawingBufferWidth,
                scene.drawingBufferHeight,
                distance,
                pixelSize
            );

            let cartographicCenter = Cartographic.fromCartesian(center, scene.globe.ellipsoid);

            return {
                center: <Size>[CesiumMath.toDegrees(cartographicCenter.longitude), CesiumMath.toDegrees(cartographicCenter.latitude)],
                resolution: Math.max(pixelSize.x, pixelSize.y),
                rotation: CesiumMath.toDegrees(camera.heading),
                pitch: 90 + CesiumMath.toDegrees(camera.pitch)
            };
        } else {
            let bs = BoundingSphere.fromEllipsoid(scene.globe.ellipsoid);

            let center = camera.positionCartographic;
            let pixelSize = new Cartesian2();

            camera.frustum.getPixelDimensions(
                scene.drawingBufferWidth,
                scene.drawingBufferHeight,
                camera.positionCartographic.height,
                pixelSize
            );

            return {
                center: <Size>[CesiumMath.toDegrees(center.longitude), CesiumMath.toDegrees(center.latitude)],
                resolution: Math.max(pixelSize.x, pixelSize.y),
                rotation: CesiumMath.toDegrees(camera.heading),
                pitch: 90 + CesiumMath.toDegrees(camera.pitch)
            };
        }
    }

    protected getViewFromProps_(viewProps) {

        let distance;
        if (this.viewer_.scene.mode !== SceneMode.SCENE2D) {
            let pixelSize = new Cartesian2();
            this.viewer_.camera.frustum.getPixelDimensions(
                this.viewer_.scene.drawingBufferWidth,
                this.viewer_.scene.drawingBufferHeight,
                1,
                pixelSize
            );
            distance = viewProps.resolution / Math.max(pixelSize.x, pixelSize.y);
        } else {
            distance = viewProps.resolution * Math.max(this.viewer_.scene.drawingBufferWidth, this.viewer_.scene.drawingBufferHeight);
        }
        return {
            destination: Cartesian3.fromDegrees(...viewProps.center, distance)
        };
    }

}

mapRendererFactory.register(CESIUM_RENDERER_ID, (props) => {
    let renderer =  new CesiumMapRenderer(props);
    return renderer;
});

