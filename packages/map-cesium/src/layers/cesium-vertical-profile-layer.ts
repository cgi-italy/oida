import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Cartographic from 'cesium/Source/Core/Cartographic';
import CesiumMath from 'cesium/Source/Core/Math';

import CallbackProperty from 'cesium/Source/DataSources/CallbackProperty';
import Color from 'cesium/Source/Core/Color';
import Entity from 'cesium/Source/DataSources/Entity';
import ImageMaterialProperty from 'cesium/Source/DataSources/ImageMaterialProperty';
import CustomDataSource from 'cesium/Source/DataSources/CustomDataSource';

import { CesiumMapLayer } from './cesium-map-layer';

import { IVerticalProfileLayerRenderer, IVerticalProfile, IVerticalProfileStyle, VerticalProfileCoordinate } from '@oida/core';

import { updateDataSource } from '../utils';

const cursor = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADsQAAA7EB9YPtSQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAF6SURBVDiNnZO9TgJBEMf/7NGcJFMsXCWKxo+EHA8gak8N9xDG5+HjMDwDodWWcOEFIBRiocT2riBhi729tYAjeh4R/HW72d/MzuxOBumcAqiZpnkBAEKINwDPABbJg5nE+oxz/mQYxq3jOEa5XDYBYDabiX6/r5RSnu/7DwDe07LeEVHguq4Kw1AnkVLqTqejiCgAUE3K50QUjMfjX2ISz/P0Jkhpa3POX1zXVX/aG9rttsrn88/bhlmWtUy79i6klLpQKCwBFBmAmuM4hmEYOx7kN9lsFo1GgwGosVwud23btrm3vcG27SPTNK9YtOZQH1prANBMCDGfTqerQwNMJpOVEGIOACeWZS2llP9p4jEDsFBKeb1eb+86ut2uiqJoCOAz3isRUeB53p/ZR6ORJiIf63n5QZWIglarFaaVI6XUzWYz3PzCm1hKDlOJc95ljN3X63VWqVSO4oYNBoMoiqKh7/uPAD52BYgpYj3OlwAghHgF8PK95pgvLpeADirdFxkAAAAASUVORK5CYII=';

export class CesiumVerticalProfileLayer extends CesiumMapLayer implements IVerticalProfileLayerRenderer {

    protected dataSource_;
    protected onCoordinateSelect_;
    protected onCoordinateHover_;

    constructor(config) {
        super(config);

        this.dataSource_ = new CustomDataSource();
        this.dataSources_.add(this.dataSource_);

        this.onCoordinateSelect_ = config.onCoordinateSelect;
        this.onCoordinateHover_ = config.onCoordinateHover;
    }

    addProfile(id: string, profile: IVerticalProfile, style: IVerticalProfileStyle) {

        if (!profile) {
            return;
        }

        let maximumHeights = this.expandProfileHeight_(profile.height, profile.bottomCoords.coordinates.length);
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

        let entity = new Entity({
            id: id,
            show: style.visible,
            wall: {
                positions: Cartesian3.fromDegreesArray(([] as any[]).concat(...profile.bottomCoords.coordinates)),
                maximumHeights: maximumHeights,
                minimumHeights: minimumHeights,
                material: material
            }
        });

        entity.layer_ = this;

        this.dataSource_.entities.add(entity);
        this.updateDataSource_();
    }

    updateProfile(id: string, profile: IVerticalProfile) {

        let entity = this.dataSource_.entities.getById(id);
        if (entity) {
            let wall = entity.wall;

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

        let entity = this.dataSource_.entities.getById(id);
        if (entity) {
            entity.show = style.visible;
            let wall = entity.wall;
            if (style.fillImage) {
                wall.material = new ImageMaterialProperty({
                    image: style.fillImage,
                    transparent: true,
                    color: style.fillColor ? new Color(...style.fillColor) : undefined
                });
            } else if (style.fillColor) {
                wall.material = new Color(...style.fillColor);
            }
            this.updateDataSource_();
        }
    }

    removeProfile(id: string) {

        let entity = this.dataSource_.entities.getById(id);

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
        let pointHighlight = this.getOrCreatePointHighlightEntity_();
        if (!pointHighlight) {
            return;
        }

        if (coord && coord.geographic) {
            pointHighlight.parent = this.getProfile(coord.profileId);
            pointHighlight.position_ = Cartesian3.fromDegrees(...coord.geographic);
        } else {
            pointHighlight.position_ = undefined;
        }
        this.updateDataSource_();
    }

    setSelectedCoordinate(coord: VerticalProfileCoordinate | undefined) {
        let pointSelect = this.getOrCreatePointSelectEntity_();
        if (!pointSelect) {
            return;
        }

        if (coord && coord.geographic) {
            pointSelect.parent = this.getProfile(coord.profileId);
            pointSelect.position_ = Cartesian3.fromDegrees(...coord.geographic);
        } else {
            pointSelect.position_ = undefined;
        }

        this.updateDataSource_();
    }

    setHighlightedRegion(region: GeoJSON.BBox | undefined) {

    }

    onLayerHover(coordinate, itemId, pickInfo) {
        if (this.onCoordinateHover_) {
            if (coordinate) {
                let cartographic = Cartographic.fromCartesian(coordinate);
                this.onCoordinateHover_([
                    CesiumMath.toDegrees(cartographic.longitude),
                    CesiumMath.toDegrees(cartographic.latitude),
                    cartographic.height
                ], itemId);
            } else {
                this.onCoordinateHover_(undefined);
            }
        }
    }

    onLayerPick(coordinate, itemId, pickInfo) {
        if (this.onCoordinateSelect_) {
            if (coordinate) {
                let cartographic = Cartographic.fromCartesian(coordinate);
                this.onCoordinateSelect_([
                    CesiumMath.toDegrees(cartographic.longitude),
                    CesiumMath.toDegrees(cartographic.latitude),
                    cartographic.height
                ], itemId);
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

            let entity = this.dataSource_.entities.add({
                id: 'highlighted-point',
                billboard: {
                    image: cursor,
                    color: new Color(1, 0.5, 0, 1),
                    eyeOffset: new Cartesian3(0, 0, -5000),
                    scale: 0.6
                }
            });

            entity.position_ = Cartesian3.fromDegrees(0, 0, 0);

            entity.position = new CallbackProperty(() => entity.position_, false);
            entity.pickingDisabled = true;
        }
        return entity;
    }

    protected getOrCreatePointSelectEntity_() {
        let entity = this.dataSource_.entities.getById('selected-point');
        if (!entity) {

            let entity = this.dataSource_.entities.add({
                id: 'selected-point',
                billboard: {
                    image: cursor,
                    color: new Color(1, 1.0, 0, 1),
                    eyeOffset: new Cartesian3(0, 0, -10000),
                    scale: 0.7
                }
            });

            entity.position_ = Cartesian3.fromDegrees(0, 0, 0);

            entity.position = new CallbackProperty(() => entity.position_, false);
            entity.pickingDisabled = true;
        }
        return entity;
    }
}
