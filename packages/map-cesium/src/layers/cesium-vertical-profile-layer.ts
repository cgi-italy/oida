import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';
import Entity from 'cesium/Source/DataSources/Entity';
import ImageMaterialProperty from 'cesium/Source/DataSources/ImageMaterialProperty';
import CustomDataSource from 'cesium/Source/DataSources/CustomDataSource';

import { CesiumMapLayer } from './cesium-map-layer';

import { IVerticalProfileLayerRenderer, IVerticalProfile, IVerticalProfileStyle } from '@oida/core';

import { updateDataSource } from '../utils';

export class CesiumVerticalProfileLayer extends CesiumMapLayer implements IVerticalProfileLayerRenderer {

    protected dataSource_;

    constructor(config) {
        super(config);

        this.dataSource_ = new CustomDataSource();
        this.dataSources_.add(this.dataSource_);
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
}
