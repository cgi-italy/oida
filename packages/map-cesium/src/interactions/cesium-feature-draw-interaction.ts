import {
    Cartesian3,
    Cartographic,
    Math as CesiumMath,
    Rectangle,
    PolygonHierarchy,
    Color,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    CallbackProperty,
    CustomDataSource,
    Entity,
    CesiumWidget,
    JulianDate
} from 'cesium';

import {
    IFeatureDrawInteractionProps,
    FEATURE_DRAW_INTERACTION_ID,
    IFeatureDrawInteractionImplementation,
    FeatureDrawMode,
    FeatureDrawOptions
} from '@oidajs/core';

import { CesiumMapRenderer } from '../map/cesium-map-renderer';
import { cesiumInteractionsFactory } from './cesium-interactions-factory';

const defaultDrawStyle = {
    fillColor: [1, 1, 1, 0.4],
    strokeColor: [0, 0, 1],
    strokeWidth: 1,
    pointSize: 8
};

export class CesiumFeatureDrawInteraction implements IFeatureDrawInteractionImplementation {
    private mapRenderer_: CesiumMapRenderer;
    private dataSource_: CustomDataSource;
    private drawEntity_: Entity | undefined;
    private cursorEntity_: Entity | undefined;
    private viewer_: CesiumWidget;
    private handler_: ScreenSpaceEventHandler | undefined;
    private drawStyle_: typeof defaultDrawStyle;

    constructor(props: IFeatureDrawInteractionProps<CesiumMapRenderer>) {
        this.mapRenderer_ = props.mapRenderer;
        this.viewer_ = props.mapRenderer.getViewer();
        this.dataSource_ = props.mapRenderer.getDefaultDataSource();
        this.drawStyle_ = {
            ...defaultDrawStyle
        };
    }

    setActive(active) {
        if (!active) {
            this.setDrawMode(FeatureDrawMode.Off, {});
        }
    }

    setDrawMode(mode: FeatureDrawMode, options: FeatureDrawOptions) {
        if (this.handler_) {
            this.handler_.destroy();
            delete this.handler_;
        }
        if (this.drawEntity_) {
            this.dataSource_.entities.remove(this.drawEntity_);
            delete this.drawEntity_;
        }

        if (this.cursorEntity_) {
            this.dataSource_.entities.remove(this.cursorEntity_);
            delete this.cursorEntity_;
        }

        if (mode !== FeatureDrawMode.Off) {
            this.handler_ = new ScreenSpaceEventHandler(this.viewer_.scene.canvas);

            let cursorPosition = new Cartesian3();

            this.cursorEntity_ = this.dataSource_.entities.add({
                // @ts-ignore: incomplete cesium typing
                position: new CallbackProperty(() => {
                    return cursorPosition;
                }, false),
                point: {
                    pixelSize: this.drawStyle_.pointSize,
                    color: new Color(...this.drawStyle_.fillColor),
                    outlineColor: new Color(...this.drawStyle_.strokeColor),
                    outlineWidth: this.drawStyle_.strokeWidth
                }
            });

            if (mode === FeatureDrawMode.Point) {
                this.drawEntity_ = this.cursorEntity_;

                this.handler_.setInputAction((evt) => {
                    const position = this.viewer_.camera.pickEllipsoid(evt.position);
                    if (position) {
                        cursorPosition = position;
                        this.onDrawEnd_(mode, options);
                    }
                }, ScreenSpaceEventType.LEFT_CLICK);

                this.handler_.setInputAction((evt) => {
                    const position = this.viewer_.camera.pickEllipsoid(evt.endPosition);
                    if (position) {
                        cursorPosition = position;
                        this.mapRenderer_.defaultDataSourceUpdate();
                    }
                }, ScreenSpaceEventType.MOUSE_MOVE);
            } else if (mode === FeatureDrawMode.Line) {
                const positions = [new Cartesian3()];

                this.drawEntity_ = this.dataSource_.entities.add({
                    polyline: {
                        positions: new CallbackProperty(() => {
                            return positions;
                        }, false),
                        clampToGround: false,
                        width: this.drawStyle_.strokeWidth,
                        material: new Color(...this.drawStyle_.strokeColor)
                    }
                });

                this.handler_.setInputAction((evt) => {
                    const position = this.viewer_.camera.pickEllipsoid(evt.position);
                    if (position) {
                        positions[positions.length - 1] = position;
                        if (options.maxCoords && positions.length === options.maxCoords) {
                            this.onDrawEnd_(mode, options);
                        } else {
                            positions.push(new Cartesian3());
                        }
                    }
                }, ScreenSpaceEventType.LEFT_CLICK);

                this.handler_.setInputAction((evt) => {
                    const position = this.viewer_.camera.pickEllipsoid(evt.endPosition);
                    if (position) {
                        cursorPosition = position;
                        positions[positions.length - 1] = position;
                        this.mapRenderer_.defaultDataSourceUpdate();
                    }
                }, ScreenSpaceEventType.MOUSE_MOVE);

                this.handler_.setInputAction((evt) => {
                    const position = this.viewer_.camera.pickEllipsoid(evt.position);
                    positions.length = positions.length - 2; //invalidate the effect of the last two click events
                    if (position) {
                        positions[positions.length - 1] = position;
                        this.onDrawEnd_(mode, options);
                    }
                }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            } else if (mode === FeatureDrawMode.BBox) {
                const bbox = [0, 0, 0, 0];

                this.drawEntity_ = this.dataSource_.entities.add({
                    rectangle: {
                        coordinates: new CallbackProperty(() => {
                            return Rectangle.fromRadians(
                                Math.min(bbox[0], bbox[2]),
                                Math.min(bbox[1], bbox[3]),
                                Math.max(bbox[0], bbox[2]),
                                Math.max(bbox[1], bbox[3])
                            );
                        }, false),
                        fill: true,
                        material: new Color(...this.drawStyle_.fillColor),
                        outline: true,
                        height: 0,
                        outlineColor: new Color(...this.drawStyle_.strokeColor),
                        outlineWidth: this.drawStyle_.strokeWidth
                    }
                });

                let firstCornerSet = false;

                this.handler_.setInputAction((evt) => {
                    const position = this.viewer_.camera.pickEllipsoid(evt.position);
                    if (position) {
                        const cartographic = Cartographic.fromCartesian(position);
                        if (!firstCornerSet) {
                            bbox[0] = cartographic.longitude;
                            bbox[1] = cartographic.latitude;
                            bbox[2] = cartographic.longitude;
                            bbox[3] = cartographic.latitude;

                            firstCornerSet = true;
                        } else {
                            bbox[2] = cartographic.longitude;
                            bbox[3] = cartographic.latitude;
                            this.onDrawEnd_(mode, options);
                        }
                    }
                }, ScreenSpaceEventType.LEFT_CLICK);

                this.handler_.setInputAction((evt) => {
                    const position = this.viewer_.camera.pickEllipsoid(evt.endPosition);
                    if (position) {
                        cursorPosition = position;
                        const cartographic = Cartographic.fromCartesian(position);
                        if (firstCornerSet) {
                            bbox[2] = cartographic.longitude;
                            bbox[3] = cartographic.latitude;
                        }
                        this.mapRenderer_.defaultDataSourceUpdate();
                    }
                }, ScreenSpaceEventType.MOUSE_MOVE);
            } else if (mode === FeatureDrawMode.Polygon) {
                const positions = [new Cartesian3()];

                this.drawEntity_ = this.dataSource_.entities.add({
                    polygon: {
                        hierarchy: new CallbackProperty(() => {
                            return new PolygonHierarchy(positions);
                        }, false),
                        height: 0,
                        outline: false,
                        outlineWidth: this.drawStyle_.strokeWidth,
                        outlineColor: new Color(...this.drawStyle_.strokeColor),
                        material: new Color(...this.drawStyle_.fillColor)
                    },
                    polyline: {
                        positions: new CallbackProperty(() => {
                            return positions.length > 1 ? [...positions, positions[0]] : positions;
                        }, false),
                        width: this.drawStyle_.strokeWidth,
                        material: new Color(...this.drawStyle_.strokeColor)
                    }
                });

                this.handler_.setInputAction((evt) => {
                    const position = this.viewer_.camera.pickEllipsoid(evt.position);
                    if (position) {
                        positions[positions.length - 1] = position;
                        if (options.maxCoords && positions.length === options.maxCoords) {
                            this.onDrawEnd_(mode, options);
                        } else {
                            positions.push(new Cartesian3());
                        }
                    }
                }, ScreenSpaceEventType.LEFT_CLICK);

                this.handler_.setInputAction((evt) => {
                    const position = this.viewer_.camera.pickEllipsoid(evt.endPosition);
                    if (position) {
                        cursorPosition = position;
                        positions[positions.length - 1] = position;
                        this.mapRenderer_.defaultDataSourceUpdate();
                    }
                }, ScreenSpaceEventType.MOUSE_MOVE);

                this.handler_.setInputAction((evt) => {
                    const position = this.viewer_.camera.pickEllipsoid(evt.position);
                    positions.length = positions.length - 2; //invalidate the effect of the last two click events
                    if (position) {
                        positions[positions.length - 1] = position;
                        this.onDrawEnd_(mode, options);
                    }
                }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            } else if (mode === FeatureDrawMode.Circle) {
                let center = new Cartesian3(1, 0, 0);
                let circlePoint = new Cartesian3(0, 1, 0);

                this.drawEntity_ = this.dataSource_.entities.add({
                    // @ts-ignore: incomplete cesium typing
                    position: new CallbackProperty(() => {
                        return center;
                    }, false),
                    ellipse: {
                        semiMajorAxis: new CallbackProperty(() => {
                            return Cartesian3.distance(center, circlePoint);
                        }, false),
                        semiMinorAxis: new CallbackProperty(() => {
                            return Cartesian3.distance(center, circlePoint);
                        }, false),
                        fill: true,
                        material: new Color(...this.drawStyle_.fillColor),
                        outline: true,
                        height: 0,
                        outlineColor: new Color(...this.drawStyle_.strokeColor),
                        outlineWidth: this.drawStyle_.strokeWidth
                    }
                });

                let centerSet = false;

                this.handler_.setInputAction((evt) => {
                    const position = this.viewer_.camera.pickEllipsoid(evt.position);
                    if (position) {
                        if (!centerSet) {
                            center = position;
                            centerSet = true;
                        } else {
                            circlePoint = position;
                            this.onDrawEnd_(mode, options);
                        }
                    }
                }, ScreenSpaceEventType.LEFT_CLICK);

                this.handler_.setInputAction((evt) => {
                    const position = this.viewer_.camera.pickEllipsoid(evt.endPosition);
                    if (position) {
                        cursorPosition = position;
                        if (centerSet) {
                            circlePoint = position;
                        }
                        this.mapRenderer_.defaultDataSourceUpdate();
                    }
                }, ScreenSpaceEventType.MOUSE_MOVE);
            }
        }

        this.mapRenderer_.defaultDataSourceUpdate();
    }

    destroy() {
        this.setDrawMode(FeatureDrawMode.Off, {});
    }

    protected onDrawEnd_(mode, options) {
        const geometry = this.getDrawnGeometry_(mode);
        this.setDrawMode(mode, options);
        if (options.onDrawEnd) {
            options.onDrawEnd({
                geometry: geometry
            });
        }
    }

    protected getCoordinates_(position: Cartesian3) {
        const cartographic = Cartographic.fromCartesian(position);
        return [CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude)];
    }

    protected getDrawnGeometry_(mode) {
        if (mode === FeatureDrawMode.Point) {
            const position = this.drawEntity_!.position!.getValue(JulianDate.now())!;
            const coords = this.getCoordinates_(position);
            return {
                type: 'Point',
                coordinates: coords
            };
        } else if (mode === FeatureDrawMode.Line) {
            const positions = this.drawEntity_!.polyline!.positions!.getValue(JulianDate.now());
            return {
                type: 'LineString',
                coordinates: positions.map((position) => this.getCoordinates_(position))
            };
        } else if (mode === FeatureDrawMode.BBox) {
            const rectangle = this.drawEntity_!.rectangle!.coordinates!.getValue(JulianDate.now());
            const bbox = [
                CesiumMath.toDegrees(rectangle.west),
                CesiumMath.toDegrees(rectangle.south),
                CesiumMath.toDegrees(rectangle.east),
                CesiumMath.toDegrees(rectangle.north)
            ];
            return {
                type: 'BBox',
                bbox: bbox
            };
        } else if (mode === FeatureDrawMode.Polygon) {
            const positions = this.drawEntity_!.polyline!.positions!.getValue(JulianDate.now());
            return {
                type: 'Polygon',
                coordinates: [positions.map((position) => this.getCoordinates_(position))]
            };
        } else if (mode === FeatureDrawMode.Circle) {
            const center = this.drawEntity_!.position!.getValue(JulianDate.now())!;
            const radius = this.drawEntity_!.ellipse!.semiMajorAxis!.getValue(JulianDate.now());
            return {
                type: 'Circle',
                center: this.getCoordinates_(center),
                radius: radius
            };
        }
    }
}

cesiumInteractionsFactory.register(FEATURE_DRAW_INTERACTION_ID, (config) => {
    return new CesiumFeatureDrawInteraction(config);
});
