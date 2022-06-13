import CesiumWidget from 'cesium/Source/Widgets/CesiumWidget/CesiumWidget';
import SceneMode from 'cesium/Source/Scene/SceneMode';
import MapMode2D from 'cesium/Source/Scene/MapMode2D';
import Rectangle from 'cesium/Source/Core/Rectangle';
import Cartesian2 from 'cesium/Source/Core/Cartesian2';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Cartographic from 'cesium/Source/Core/Cartographic';
import BoundingSphere from 'cesium/Source/Core/BoundingSphere';
import CesiumMath from 'cesium/Source/Core/Math';
import HeadingPitchRange from 'cesium/Source/Core/HeadingPitchRange';
import Ray from 'cesium/Source/Core/Ray';
import IntersectionTests from 'cesium/Source/Core/IntersectionTests';
import Plane from 'cesium/Source/Core/Plane';
import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';
import CustomDataSource from 'cesium/Source/DataSources/CustomDataSource';
import DataSourceCollection from 'cesium/Source/DataSources/DataSourceCollection';
import DataSourceDisplay from 'cesium/Source/DataSources/DataSourceDisplay';

import 'cesium/Source/Widgets/CesiumWidget/CesiumWidget.css';

import { IMapRenderer, IMapRendererProps, IMapViewport, BBox, Size, FitExtentOptions } from '@oidajs/core';

import { cesiumLayersFactory } from '../layers/cesium-layers-factory';
import { cesiumInteractionsFactory } from '../interactions/cesium-interactions-factory';
import { CesiumGroupLayer } from '../layers';
import { getProjectionFromSRS } from '../utils/projection';
import { updateDataSource } from '../utils';

export const CESIUM_RENDERER_ID = 'cesium';

export type CesiumMapRendererProps = IMapRendererProps & {
    allowFreeCameraRotation?: boolean;
    sceneMode?: string;
};

export class CesiumMapRenderer implements IMapRenderer {
    private viewer_: CesiumWidget;
    private layerGroup_: CesiumGroupLayer | undefined;
    private dataSourceCollection_;
    private dataSourceDisplay_;

    constructor(props: CesiumMapRendererProps) {
        this.initRenderer_(props);
    }

    get id() {
        return CESIUM_RENDERER_ID;
    }

    setTarget(target: HTMLElement) {
        const parent = this.viewer_.container.parentNode;
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
        const view = this.getViewFromProps_(viewport);
        if (animate) {
            this.viewer_.camera.flyTo({
                ...view,
                duration: 1.5
            });
        } else {
            this.viewer_.camera.setView(view);
        }
    }

    updateRendererProps(props: CesiumMapRendererProps) {
        if (props.sceneMode !== undefined) {
            const sceneMode = this.getSceneMode_(props);
            this.viewer_.scene.mode = sceneMode;
        }
        if (props.allowFreeCameraRotation !== undefined) {
            const contrainedAxis = props.allowFreeCameraRotation ? undefined : new Cartesian3(0, 0, 1);
            this.viewer_.camera.constrainedAxis = contrainedAxis;
        }
    }

    fitExtent(extent, options?: FitExtentOptions) {
        const destination = Rectangle.fromDegrees(...extent);
        const boundingSphere = BoundingSphere.fromRectangle3D(destination);

        if (options?.padding) {
            // TODO: add support for non uniform padding
            const padding = (options.padding[0] + options.padding[1] + options.padding[2] + options.padding[3]) / 4;
            boundingSphere.radius = boundingSphere.radius * (1 + padding);
        }

        const hpr = new HeadingPitchRange(
            CesiumMath.toRadians(options?.rotation || 0),
            CesiumMath.toRadians((options?.pitch || 0) - 90),
            boundingSphere.radius ? 0 : this.viewer_.camera.positionCartographic.height
        );
        if (options?.animate) {
            this.viewer_.camera.flyToBoundingSphere(boundingSphere, {
                offset: hpr
            });
        } else {
            // we use the flyToBoundingSphere method with a 0 duration as the viewBoundingSphere method
            // will set a camera transform (camera view locked to the target center) and that's not what we want
            this.viewer_.camera.flyToBoundingSphere(boundingSphere, {
                offset: hpr,
                duration: 0
            });
        }
    }

    getViewportExtent() {
        const rectangle = this.viewer_.camera.computeViewRectangle();
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
        return cesiumLayersFactory;
    }

    getInteractionsFactory() {
        return cesiumInteractionsFactory;
    }

    getViewer() {
        return this.viewer_;
    }

    getSize() {
        const canvas: HTMLCanvasElement = this.viewer_.canvas;
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
        const rootCollection = this.layerGroup_.getImageries()._layers;

        const reduceFunction = (imageries, item) => {
            if (item instanceof ImageryLayer) {
                return [...imageries, item];
            } else {
                return item._layers.reduce(reduceFunction, imageries);
            }
        };

        const imageries = rootCollection.reduce(reduceFunction, []);

        this.viewer_.imageryLayers.removeAll(false);

        imageries.forEach((item) => {
            this.viewer_.imageryLayers.add(item);
        });
    }

    refreshImageriesFromEvent(evt) {
        if (!this.layerGroup_) {
            return;
        }

        const { type, collection, item, idx } = evt;

        if (type === 'add') {
            let globalindexFound = false;

            const rootCollection = this.layerGroup_.getImageries()._layers;

            const reduceFunction = (globalIndex, item) => {
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
            };

            let globalIndex = rootCollection.reduce(reduceFunction, 0);
            if (!globalindexFound) {
                return;
            }

            const imageriesToAdd = this.getImageryLayers_(item);

            imageriesToAdd.forEach((imagery) => {
                this.viewer_.imageryLayers.add(imagery, globalIndex++);
            });
        } else if (type === 'remove') {
            const imageriesToRemove = this.getImageryLayers_(item);
            imageriesToRemove.forEach((imagery) => {
                this.viewer_.imageryLayers.remove(imagery, false);
            });
        }
    }

    refreshDataSources() {
        if (!this.layerGroup_) {
            return;
        }
        const rootCollection = this.layerGroup_.getDataSources()._dataSources;

        const reduceFunction = (datasources, item) => {
            if (item instanceof CustomDataSource) {
                return [...datasources, item];
            } else {
                return item._dataSources.reduce(reduceFunction, datasources);
            }
        };

        const dataSources = rootCollection.reduce(reduceFunction, []);

        this.dataSourceCollection_.removeAll(false);

        dataSources.forEach((item) => {
            this.dataSourceCollection_.add(item);
        });
    }

    refreshDataSourcesFromEvent(evt) {
        if (!this.layerGroup_) {
            return;
        }

        const { type, collection, item, idx } = evt;

        if (type === 'add') {
            let globalindexFound = false;

            const rootCollection = this.layerGroup_.getDataSources()._dataSources;

            const reduceFunction = (globalIndex, item) => {
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
            };

            let globalIndex = rootCollection.reduce(reduceFunction, 0);
            if (!globalindexFound) {
                return;
            }

            const dataSourcesToAdd = this.getDataSources_(item);

            dataSourcesToAdd.forEach((dataSource) => {
                this.dataSourceCollection_.add(dataSource, globalIndex++);
            });
        } else if (type === 'remove') {
            const dataSourcesToRemove = this.getDataSources_(item);
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
        const parent = this.viewer_.container.parentNode;
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
        const reduceFunction = (imageries, item) => {
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
        const reduceFunction = (dataSources, item) => {
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

    protected initRenderer_(props: CesiumMapRendererProps) {
        const { projection, viewport, target, onViewUpdating, onViewUpdated, ...renderProps } = props;

        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';

        if (target) {
            target.appendChild(container);
        }

        const mapProjection = getProjectionFromSRS(projection.code, true);

        this.viewer_ = new CesiumWidget(container, {
            useBrowserRecommendedResolution: false,
            ...renderProps,
            imageryProvider: false,
            sceneMode: this.getSceneMode_(renderProps),
            mapProjection: mapProjection,
            requestRenderMode: true,
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

        this.dataSourceCollection_ = new DataSourceCollection();

        this.dataSourceDisplay_ = new DataSourceDisplay({
            scene: this.viewer_.scene,
            dataSourceCollection: this.dataSourceCollection_
        });

        if (onViewUpdating) {
            const duringMove = () => {
                onViewUpdating(this.computeCurrentView_());
            };

            this.viewer_.camera.moveStart.addEventListener(() => {
                if (this.viewer_.scene.mode === SceneMode.MORPHING) {
                    return;
                }
                onViewUpdating();
                this.viewer_.scene.postRender.addEventListener(duringMove);
            });

            this.viewer_.camera.moveEnd.addEventListener(() => {
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

    protected getSceneMode_(props: Omit<CesiumMapRendererProps, keyof IMapRendererProps>) {
        if (props.sceneMode === 'columbus') {
            return SceneMode.COLUMBUS_VIEW;
        } else if (props.sceneMode === '2D') {
            return SceneMode.SCENE2D;
        } else {
            return SceneMode.SCENE3D;
        }
    }

    protected computeCurrentView_() {
        const camera = this.viewer_.camera;
        const scene = this.viewer_.scene;

        if (scene.mode === SceneMode.COLUMBUS_VIEW) {
            const distance = camera.position.z / Math.cos(Math.PI / 2 + camera.pitch);

            const ray = new Ray(camera.position, camera.direction);
            const intersection = IntersectionTests.rayPlane(ray, Plane.ORIGIN_XY_PLANE);

            let center;

            if (intersection) {
                center = camera._projection.unproject(intersection);
            } else {
                center = camera.positionCartographic;
            }

            const pixelSize = new Cartesian2();
            camera.frustum.getPixelDimensions(scene.drawingBufferWidth, scene.drawingBufferHeight, distance, scene.pixelRatio, pixelSize);

            const resolution = Math.max(pixelSize.x, pixelSize.y);

            return {
                center: <Size>[CesiumMath.toDegrees(center.longitude), CesiumMath.toDegrees(center.latitude)],
                resolution,
                rotation: CesiumMath.toDegrees(camera.heading),
                pitch: 90 + CesiumMath.toDegrees(camera.pitch)
            };
        }

        const center = camera.pickEllipsoid(
            new Cartesian2(scene.drawingBufferWidth / 2, scene.drawingBufferHeight / 2),
            scene.globe.ellipsoid
        );
        if (center) {
            const distance = Cartesian3.distance(camera.positionWC, center);
            const pixelSize = new Cartesian2();
            camera.frustum.getPixelDimensions(scene.drawingBufferWidth, scene.drawingBufferHeight, distance, scene.pixelRatio, pixelSize);

            const cartographicCenter = Cartographic.fromCartesian(center, scene.globe.ellipsoid);

            return {
                center: <Size>[CesiumMath.toDegrees(cartographicCenter.longitude), CesiumMath.toDegrees(cartographicCenter.latitude)],
                resolution: Math.max(pixelSize.x, pixelSize.y),
                rotation: CesiumMath.toDegrees(camera.heading),
                pitch: 90 + CesiumMath.toDegrees(camera.pitch)
            };
        } else {
            const center = camera.positionCartographic;
            const pixelSize = new Cartesian2();

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
            const pixelSize = new Cartesian2();
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
