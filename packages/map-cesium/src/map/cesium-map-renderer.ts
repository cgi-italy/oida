import CesiumWidget from  'cesium/Source/Widgets/CesiumWidget/CesiumWidget';
import SceneMode from 'cesium/Source/Scene/SceneMode';
import MapMode2D from 'cesium/Source/Scene/MapMode2D';

import BoundingSphere from 'cesium/Source/Core/BoundingSphere';
import Rectangle from 'cesium/Source/Core/Rectangle';
import Cartesian2 from 'cesium/Source/Core/Cartesian2';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Cartographic from 'cesium/Source/Core/Cartographic';
import CesiumMath from 'cesium/Source/Core/Math';

import Ray from 'cesium/Source/Core/Ray';
import IntersectionTests from 'cesium/Source/Core/IntersectionTests';
import Plane from 'cesium/Source/Core/Plane';

import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';
import CustomDataSource from 'cesium/Source/DataSources/CustomDataSource';
import DataSourceCollection from 'cesium/Source/DataSources/DataSourceCollection';
import DataSourceDisplay from 'cesium/Source/DataSources/DataSourceDisplay';

import 'cesium/Source/Widgets/CesiumWidget/CesiumWidget.css';

import { mapRendererFactory, IMapRenderer, IMapRendererProps, IMapViewport, IDynamicFactory, ILayerRenderer, BBox, Size } from '@oida/core';

import { cesiumLayersFactory } from '../layers/cesium-layers-factory';
import { cesiumInteractionsFactory } from '../interactions/cesium-interactions-factory';
import { CesiumGroupLayer } from '../layers';
import { getProjectionFromSRS } from '../utils/projection';
import { updateDataSource } from '../utils';

export const CESIUM_RENDERER_ID = 'cesium';

export type CesiumMapRendererProps = {
    allowFreeCameraRotation: boolean;
    sceneMode: string
};

export class CesiumMapRenderer implements IMapRenderer {

    private viewer_: CesiumWidget;
    private layerGroup_: CesiumGroupLayer | undefined;
    private dataSourceCollection_;
    private dataSourceDisplay_;

    constructor(props: IMapRendererProps & CesiumMapRendererProps) {
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


    setViewport(viewport: IMapViewport, animate?: boolean) {
        let view = this.getViewFromProps_(viewport);
        if (animate) {
            this.viewer_.camera.flyTo({
                ...view,
                duration: 1.5
            });
        } else {
            this.viewer_.camera.setView(view);
        }
    }

    updateRendererProps(props: Partial<CesiumMapRendererProps>) {
        if (props.sceneMode !== undefined) {
            let sceneMode = this.getSceneMode_(props);
            this.viewer_.scene.mode = sceneMode;
        }
        if (props.allowFreeCameraRotation !== undefined) {
            let contrainedAxis = props.allowFreeCameraRotation ? undefined : new Cartesian3(0, 0, 1);
            this.viewer_.camera.constrainedAxis = contrainedAxis;
        }
    }

    fitExtent(extent, animate?: boolean) {
        let eps = 0.01;

        let destination;
        if (extent[2] - extent[0] <= eps || extent[3] - extent[1] <= eps) {
            destination = Cartesian3.fromDegrees(extent[0], extent[1], this.viewer_.camera.positionCartographic.height);
        } else {
            destination = Rectangle.fromDegrees(...extent);
        }
        if (animate) {
            this.viewer_.camera.flyTo({
                destination : destination
            });
        } else {
            this.viewer_.camera.setView({
                destination : destination
            });
        }
    }

    getViewportExtent() {
        let rectangle =  this.viewer_.camera.computeViewRectangle();
        return <BBox>[
            CesiumMath.toDegrees(rectangle.west),
            CesiumMath.toDegrees(rectangle.south),
            CesiumMath.toDegrees(rectangle.east),
            CesiumMath.toDegrees(rectangle.north)
        ];
    }

    setLayerGroup(group: CesiumGroupLayer) {
        this.layerGroup_ = group;
        this.viewer_.scene.primitives.add(group.getPrimitives());

        this.refreshImageries();
        this.refreshDataSources();
    }

    getLayersFactory() {
        return cesiumLayersFactory as unknown as IDynamicFactory<ILayerRenderer>;
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

    updateSize() {
        if (this.viewer_ && this.viewer_.scene) {
            this.viewer_.scene.requestRender();
        }
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

    refreshImageriesFromEvent(evt) {

        if (!this.layerGroup_) {
            return;
        }

        let {type, collection, item, idx} = evt;

        if (type === 'add') {
            let globalindexFound = false;

            let rootCollection = this.layerGroup_.getImageries()._layers;

            const reduceFunction = ((globalIndex, item) => {
                if (globalindexFound) {
                    return globalIndex;
                }
                if (item === collection) {
                    globalindexFound = true;
                    return globalIndex + idx;
                } else if (item instanceof ImageryLayer) {
                    return globalIndex + 1;
                } else {
                    return item._layers.reduce(reduceFunction, globalIndex);
                }
            });

            let globalIndex = rootCollection.reduce(reduceFunction, 0);
            if (!globalindexFound) {
                return;
            }

            let imageriesToAdd = this.getImageryLayers_(item);

            imageriesToAdd.forEach((imagery) => {
                this.viewer_.imageryLayers.add(imagery, globalIndex++);
            });

        } else if (type === 'remove') {
            let imageriesToRemove = this.getImageryLayers_(item);
            imageriesToRemove.forEach((imagery) => {
                this.viewer_.imageryLayers.remove(imagery, false);
            });
        }
    }

    refreshDataSources() {

        if (!this.layerGroup_) {
            return;
        }
        let rootCollection = this.layerGroup_.getDataSources()._dataSources;

        let reduceFunction = (datasources, item) => {
            if (item instanceof CustomDataSource) {
                return [...datasources, item];
            } else {
                return item._dataSources.reduce(reduceFunction, datasources);
            }
        };

        let dataSources = rootCollection.reduce(reduceFunction, []);

        this.dataSourceCollection_.removeAll(false);

        dataSources.forEach((item) => {
            this.dataSourceCollection_.add(item);
        });
    }

    refreshDataSourcesFromEvent(evt) {

        if (!this.layerGroup_) {
            return;
        }

        let {type, collection, item, idx} = evt;

        if (type === 'add') {
            let globalindexFound = false;

            let rootCollection = this.layerGroup_.getDataSources()._dataSources;

            const reduceFunction = ((globalIndex, item) => {
                if (globalindexFound) {
                    return globalIndex;
                }
                if (item === collection) {
                    globalindexFound = true;
                    return globalIndex + idx;
                } else if (item instanceof CustomDataSource) {
                    return globalIndex + 1;
                } else {
                    return item._dataSources.reduce(reduceFunction, globalIndex);
                }
            });

            let globalIndex = rootCollection.reduce(reduceFunction, 0);
            if (!globalindexFound) {
                return;
            }

            let dataSourcesToAdd = this.getDataSources_(item);

            dataSourcesToAdd.forEach((dataSource) => {
                this.dataSourceCollection_.add(dataSource, globalIndex++);
            });

        } else if (type === 'remove') {
            let dataSourcesToRemove = this.getDataSources_(item);
            dataSourcesToRemove.forEach((dataSource) => {
                this.dataSourceCollection_.remove(dataSource, false);
            });
        }
    }

    getDefaultDataSource() {
        return this.dataSourceDisplay_.defaultDataSource;
    }

    defaultDataSourceUpdate() {
        if (this.viewer_.scene) {
            updateDataSource(this.dataSourceDisplay_.defaultDataSource, this.viewer_.scene);
        }
    }

    destroy() {
        let parent = this.viewer_.container.parentNode;
        if (parent) {
            parent.removeChild(this.viewer_.container);
        }
        this.viewer_.imageryLayers.removeAll(false);
        this.viewer_.scene.primitives.remove(this.layerGroup_!.getPrimitives());
        this.dataSourceCollection_.removeAll(false);

        this.dataSourceDisplay_.destroy();

        this.viewer_.destroy();
    }

    protected getImageryLayers_(imageryOrCollection) {
        let reduceFunction = (imageries, item) => {
            if (item instanceof ImageryLayer) {
                return [...imageries, item];
            } else {
                return item._layers.reduce(reduceFunction, imageries);
            }
        };

        if (imageryOrCollection instanceof ImageryLayer) {
            return [imageryOrCollection];
        } else {
            return imageryOrCollection._layers.reduce(reduceFunction, []);
        }
    }

    protected getDataSources_(dataSourceOrCollection) {
        let reduceFunction = (dataSources, item) => {
            if (item instanceof CustomDataSource) {
                return [...dataSources, item];
            } else {
                return item._dataSources.reduce(reduceFunction, dataSources);
            }
        };

        if (dataSourceOrCollection instanceof CustomDataSource) {
            return [dataSourceOrCollection];
        } else {
            return dataSourceOrCollection._dataSources.reduce(reduceFunction, []);
        }
    }


    protected initRenderer_(props: IMapRendererProps & CesiumMapRendererProps) {

        const {projection, viewport, target, onViewUpdating, onViewUpdated, ...renderProps} = props;

        let container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';


        if (target) {
            target.appendChild(container);
        }

        let mapProjection = getProjectionFromSRS(projection.code, true);

        this.viewer_ = new CesiumWidget(container, {
            ...renderProps,
            imageryProvider: false,
            sceneMode: this.getSceneMode_(renderProps),
            mapProjection: mapProjection,
            requestRenderMode : true,
            mapMode2D: projection.wrapX ? MapMode2D.INFINITE_SCROLL : MapMode2D.ROTATE
        });

        this.viewer_.scene.primitives.destroyPrimitives = false;
        this.viewer_.scene.pickTranslucentDepth = true;

        if (props.target) {
            this.viewer_.camera.setView(this.getViewFromProps_(viewport));
        } else {
            this.viewer_.pendingViewport_ = viewport;
        }

        if (renderProps.allowFreeCameraRotation) {
            this.viewer_.camera.constrainedAxis = undefined;
        }

        this.dataSourceCollection_ =  new DataSourceCollection();

        this.dataSourceDisplay_ = new DataSourceDisplay({
            scene : this.viewer_.scene,
            dataSourceCollection : this.dataSourceCollection_
        });

        if (onViewUpdating) {

            let duringMove = (evt) => {
                onViewUpdating(this.computeCurrentView_());
            };

            this.viewer_.camera.moveStart.addEventListener((evt) => {
                if (this.viewer_.scene.mode === SceneMode.MORPHING) {
                    return;
                }
                onViewUpdating();
                this.viewer_.scene.postRender.addEventListener(duringMove);
            });

            this.viewer_.camera.moveEnd.addEventListener((evt) => {
                if (this.viewer_.scene.mode === SceneMode.MORPHING) {
                    return;
                }
                this.viewer_.scene.postRender.removeEventListener(duringMove);
                if (onViewUpdated) {
                    onViewUpdated(this.computeCurrentView_());
                }
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
                scene.pixelRatio,
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
                scene.pixelRatio,
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
                scene.pixelRatio,
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
                this.viewer_.scene.pixelRatio,
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

