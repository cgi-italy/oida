import {
    Cartesian3,
    Cartographic,
    Math as CesiumMath,
    CallbackProperty,
    Color,
    Entity,
    ImageMaterialProperty,
    CustomDataSource
} from 'cesium';

import {
    IVerticalProfileLayerRenderer,
    VerticalProfileLayerRendererConfig,
    IVerticalProfile,
    IVerticalProfileStyle,
    VerticalProfileCoordinate,
    MapCoord
} from '@oidajs/core';

import { CesiumMapLayer } from './cesium-map-layer';
import { PickInfo, PICK_INFO_KEY, updateDataSource } from '../utils';

const cursor =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADsQAAA7EB9YPtSQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAF6SURBVDiNnZO9TgJBEMf/7NGcJFMsXCWKxo+EHA8gak8N9xDG5+HjMDwDodWWcOEFIBRiocT2riBhi729tYAjeh4R/HW72d/MzuxOBumcAqiZpnkBAEKINwDPABbJg5nE+oxz/mQYxq3jOEa5XDYBYDabiX6/r5RSnu/7DwDe07LeEVHguq4Kw1AnkVLqTqejiCgAUE3K50QUjMfjX2ISz/P0Jkhpa3POX1zXVX/aG9rttsrn88/bhlmWtUy79i6klLpQKCwBFBmAmuM4hmEYOx7kN9lsFo1GgwGosVwud23btrm3vcG27SPTNK9YtOZQH1prANBMCDGfTqerQwNMJpOVEGIOACeWZS2llP9p4jEDsFBKeb1eb+86ut2uiqJoCOAz3isRUeB53p/ZR6ORJiIf63n5QZWIglarFaaVI6XUzWYz3PzCm1hKDlOJc95ljN3X63VWqVSO4oYNBoMoiqKh7/uPAD52BYgpYj3OlwAghHgF8PK95pgvLpeADirdFxkAAAAASUVORK5CYII=';

export class CesiumVerticalProfileLayer extends CesiumMapLayer implements IVerticalProfileLayerRenderer {
    protected dataSource_: CustomDataSource;
    protected onCoordinateSelect_: ((selected?: { profileId: string; coordinate: number[] }) => void) | undefined;
    protected onCoordinateHover_: ((selected?: { profileId: string; coordinate: number[] }) => void) | undefined;

    constructor(config: VerticalProfileLayerRendererConfig) {
        super(config);

        this.dataSource_ = new CustomDataSource();
        this.dataSources_.add(this.dataSource_);

        this.onCoordinateSelect_ = config.onCoordinateSelect;
        this.onCoordinateHover_ = config.onCoordinateHover;
    }

    addProfile(id: string, profile: IVerticalProfile, style: IVerticalProfileStyle, data?: any) {
        if (!profile) {
            return;
        }

        const maximumHeights = this.expandProfileHeight_(profile.height, profile.bottomCoords.coordinates.length);
        let minimumHeights;
        if (profile.bottomHeight) {
            minimumHeights = this.expandProfileHeight_(profile.bottomHeight, profile.bottomCoords.coordinates.length);
        }

        let material;
        if (style.fillImage) {
            material = new ImageMaterialProperty({
                image: style.fillImage,
                transparent: true,
                color: style.fillColor ? new Color(...style.fillColor) : undefined
            });
        } else if (style.fillColor) {
            material = new Color(...style.fillColor);
        }

        const entity = new Entity({
            id: id,
            show: style.visible,
            wall: {
                positions: Cartesian3.fromDegreesArray(([] as any[]).concat(...profile.bottomCoords.coordinates)),
                maximumHeights: maximumHeights,
                minimumHeights: minimumHeights,
                material: material
            }
        });

        const pickInfo: PickInfo = {
            id: id,
            data: data,
            layer: this,
            pickable: true
        };

        entity[PICK_INFO_KEY] = pickInfo;

        this.dataSource_.entities.add(entity);
        this.updateDataSource_();
    }

    updateProfile(id: string, profile: IVerticalProfile) {
        const entity = this.dataSource_.entities.getById(id);
        if (entity) {
            // TODO: cesium typings are wrong so we cast to any
            const wall = entity.wall as any;

            wall.positions = Cartesian3.fromDegreesArray(([] as any[]).concat(...profile.bottomCoords.coordinates));
            wall.maximumHeights = this.expandProfileHeight_(profile.height, profile.bottomCoords.coordinates.length);
            if (profile.bottomHeight) {
                wall.minimumHeights = this.expandProfileHeight_(profile.bottomHeight, profile.bottomCoords.coordinates.length);
            } else {
                wall.minimumHeights = undefined;
            }

            this.updateDataSource_();
        }
    }

    updateProfileStyle(id, style: IVerticalProfileStyle) {
        const entity = this.dataSource_.entities.getById(id);
        if (entity) {
            entity.show = style.visible;
            const wall = entity.wall;
            if (wall) {
                if (style.fillImage) {
                    wall.material = new ImageMaterialProperty({
                        image: style.fillImage,
                        transparent: true,
                        color: style.fillColor ? new Color(...style.fillColor) : undefined
                    });
                } else if (style.fillColor) {
                    // @ts-ignore: wrong cesium typings
                    wall.material = new Color(...style.fillColor);
                }
                this.updateDataSource_();
            }
        }
    }

    removeProfile(id: string) {
        const entity = this.dataSource_.entities.getById(id);

        if (entity) {
            this.dataSource_.entities.remove(entity);
            this.updateDataSource_();
        }
    }

    getProfile(id: string) {
        return this.dataSource_.entities.getById(id);
    }

    removeAllProfiles() {
        this.dataSource_.entities.removeAll();
        this.updateDataSource_();
    }

    setHighlightedCoordinate(coord: VerticalProfileCoordinate | undefined) {
        const pointHighlight = this.getOrCreatePointHighlightEntity_();
        if (!pointHighlight) {
            return;
        }

        if (coord && coord.geographic) {
            pointHighlight.parent = this.getProfile(coord.profileId);
            pointHighlight['position_'] = Cartesian3.fromDegrees(...(coord.geographic as MapCoord));
        } else {
            pointHighlight['position_'] = undefined;
        }
        this.updateDataSource_();
    }

    setSelectedCoordinate(coord: VerticalProfileCoordinate | undefined) {
        const pointSelect = this.getOrCreatePointSelectEntity_();
        if (!pointSelect) {
            return;
        }

        if (coord && coord.geographic) {
            pointSelect.parent = this.getProfile(coord.profileId);
            pointSelect['position_'] = Cartesian3.fromDegrees(...(coord.geographic as MapCoord));
        } else {
            pointSelect['position_'] = undefined;
        }

        this.updateDataSource_();
    }

    setHighlightedRegion(region: GeoJSON.BBox | undefined) {
        return;
    }

    shouldReceiveFeatureHoverEvents() {
        return true;
    }

    shouldReceiveFeatureSelectEvents() {
        return true;
    }

    onFeatureHover(coordinate: Cartesian3, pickInfo: PickInfo) {
        if (this.onCoordinateHover_) {
            if (coordinate) {
                const cartographic = Cartographic.fromCartesian(coordinate);
                this.onCoordinateHover_({
                    profileId: pickInfo.id,
                    coordinate: [
                        CesiumMath.toDegrees(cartographic.longitude),
                        CesiumMath.toDegrees(cartographic.latitude),
                        cartographic.height
                    ]
                });
            } else {
                this.onCoordinateHover_(undefined);
            }
        }
    }

    onFeatureSelect(coordinate: Cartesian3, pickInfo: PickInfo) {
        if (this.onCoordinateSelect_) {
            if (coordinate) {
                const cartographic = Cartographic.fromCartesian(coordinate);
                this.onCoordinateSelect_({
                    profileId: pickInfo.id,
                    coordinate: [
                        CesiumMath.toDegrees(cartographic.longitude),
                        CesiumMath.toDegrees(cartographic.latitude),
                        cartographic.height
                    ]
                });
            } else {
                this.onCoordinateSelect_(undefined);
            }
        }
    }

    protected updateDataSource_() {
        updateDataSource(this.dataSource_, this.mapRenderer_.getViewer().scene);
    }

    protected expandProfileHeight_(height: number | number[], coordsCount: number) {
        let heights: number[];
        if (Array.isArray(height)) {
            heights = height;
        } else {
            heights = new Array(coordsCount).fill(height);
        }
        return heights;
    }

    protected getOrCreatePointHighlightEntity_() {
        let entity = this.dataSource_.entities.getById('highlighted-point');
        if (!entity) {
            entity = this.dataSource_.entities.add({
                id: 'highlighted-point',
                billboard: {
                    image: cursor,
                    color: new Color(1, 0.5, 0, 1),
                    eyeOffset: new Cartesian3(0, 0, -5000),
                    scale: 0.6
                }
            });

            entity['position_'] = Cartesian3.fromDegrees(0, 0, 0);

            // @ts-ignore: wrong cesium typings
            entity.position = new CallbackProperty(() => entity!['position_'], false);

            entity[PICK_INFO_KEY] = {
                pickable: false
            };
        }
        return entity;
    }

    protected getOrCreatePointSelectEntity_() {
        let entity = this.dataSource_.entities.getById('selected-point');
        if (!entity) {
            entity = this.dataSource_.entities.add({
                id: 'selected-point',
                billboard: {
                    image: cursor,
                    color: new Color(1, 1.0, 0, 1),
                    eyeOffset: new Cartesian3(0, 0, -10000),
                    scale: 0.7
                }
            });

            entity['position_'] = Cartesian3.fromDegrees(0, 0, 0);

            // @ts-ignore: wrong cesium typings
            entity.position = new CallbackProperty(() => entity!['position_'], false);

            entity[PICK_INFO_KEY] = {
                pickable: false
            };
        }
        return entity;
    }
}
