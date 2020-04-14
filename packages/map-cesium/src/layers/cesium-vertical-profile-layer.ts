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

                let highlightEntity = this.dataSource_.entities.getById('highlighted-point');
                if (pickInfo.id === highlightEntity) {
                    return;
                } else {
                    let selectEntity = this.dataSource_.entities.getById('selected-point');
                    if (pickInfo.id === selectEntity) {
                        coordinate = selectEntity.position_;
                    }
                }

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
                let highlightEntity = this.dataSource_.entities.getById('highlighted-point');
                if (pickInfo.id === highlightEntity) {
                    coordinate = highlightEntity.position_;
                } else {
                    let selectEntity = this.dataSource_.entities.getById('selected-point');
                    if (pickInfo.id === selectEntity) {
                        return;
                    }
                }

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
                ellipsoid: {
                    radii: new Cartesian3(50000.0, 50000.0, 50000.0),
                    material: new Color(1, 0.5, 0, 1)
                }
            });

            entity.position_ = Cartesian3.fromDegrees(0, 0, 0);

            entity.position = new CallbackProperty(() => entity.position_, false);
        }
        return entity;
    }

    protected getOrCreatePointSelectEntity_() {
        let entity = this.dataSource_.entities.getById('selected-point');
        if (!entity) {

            let entity = this.dataSource_.entities.add({
                id: 'selected-point',
                ellipsoid: {
                    radii: new Cartesian3(60000.0, 60000.0, 60000.0),
                    material: new Color(1, 1.0, 0, 1),
                    outline: false
                }
            });

            entity.position_ = Cartesian3.fromDegrees(0, 0, 0);

            entity.position = new CallbackProperty(() => entity.position_, false);
        }
        return entity;
    }
}
