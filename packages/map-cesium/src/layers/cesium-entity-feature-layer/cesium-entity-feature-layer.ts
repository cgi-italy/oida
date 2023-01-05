import { Cartesian3, Cartographic, Math as CesiumMath, CustomDataSource, Entity } from 'cesium';
import { GeoJsonGeometryTypes } from 'geojson';

import { IFeatureLayerRenderer, IFeatureStyle, IFeature, FeatureGeometry, FeatureLayerRendererConfig } from '@oidajs/core';

import { CesiumFeatureCoordPickMode, PickInfo, PICK_INFO_KEY, updateDataSource } from '../../utils';
import { CesiumMapLayer } from '../cesium-map-layer';
import { CesiumFeatureLayerProps } from '../cesium-feature-layer';
import { geometryEntityRendererFactory, CesiumGeometryEntityRenderer } from './geometry-entity-renderers';

const ENTITY_GEOMETRY_TYPE_KEY = 'geometryType';
const ENTITY_GEOMETRY_RENDERER_KEY = 'geometryRenderer';

export class CesiumEntityFeatureLayer extends CesiumMapLayer implements IFeatureLayerRenderer {
    protected clampToGround_: boolean;
    protected onFeatureHover_: ((feature: IFeature<any>, coordinate: GeoJSON.Position) => void) | undefined;
    protected onFeatureSelect_: ((feature: IFeature<any>, coordinate: GeoJSON.Position) => void) | undefined;
    protected coordPickMode_: CesiumFeatureCoordPickMode;
    protected dataSource_: CustomDataSource;

    constructor(config: FeatureLayerRendererConfig & CesiumFeatureLayerProps) {
        super(config);

        this.clampToGround_ = config.clampToGround || false;
        this.onFeatureHover_ = config.onFeatureHover;
        this.onFeatureSelect_ = config.onFeatureSelect;
        this.coordPickMode_ = config.coordPickMode || CesiumFeatureCoordPickMode.Ellipsoid;

        this.dataSource_ = new CustomDataSource();
        this.dataSources_.add(this.dataSource_);
    }

    addFeature(id: string, geometry: FeatureGeometry, style: IFeatureStyle, data: any) {
        if (!geometry) {
            return;
        }

        const geometryRenderer = geometryEntityRendererFactory.create(geometry.type, {});

        if (geometryRenderer) {
            try {
                const entity = geometryRenderer.create(id, geometry, style, {
                    clampToGround: this.clampToGround_
                });

                if (entity) {
                    this.dataSource_.entities.add(entity);
                    // @ts-ignore: need access to private entity children
                    entity._children.forEach((childEntity) => {
                        this.dataSource_.entities.add(childEntity);
                    });
                    entity[ENTITY_GEOMETRY_RENDERER_KEY] = geometryRenderer;
                    entity[ENTITY_GEOMETRY_TYPE_KEY] = geometry.type;

                    const pickInfo: PickInfo = {
                        id: id,
                        data: data,
                        layer: this,
                        pickable: this.isPickable_(geometry.type, style)
                    };

                    entity[PICK_INFO_KEY] = pickInfo;

                    this.updateDataSource_();
                }

                return {
                    id: id,
                    data: data,
                    entity: entity
                };
            } catch {
                return undefined;
            }
        }
    }

    updateFeatureGeometry(id: string, geometry: FeatureGeometry) {
        const entity = this.dataSource_.entities.getById(id);
        if (entity) {
            if (this.getGeometryTypeForEntity_(entity) === geometry.type) {
                this.getGeometryRendererForEntity_(entity).updateGeometry(entity, geometry);
                this.updateDataSource_();
            } else {
                throw 'Feature geometry must be of the same class';
            }
        }
    }

    updateFeatureStyle(id: string, style: IFeatureStyle) {
        const entity = this.dataSource_.entities.getById(id);
        if (entity) {
            this.getGeometryRendererForEntity_(entity).updateStyle(entity, style);
            entity[PICK_INFO_KEY].pickable = this.isPickable_(this.getGeometryTypeForEntity_(entity), style);
            this.updateDataSource_();
        }
    }

    removeFeature(id: string) {
        const entity = this.dataSource_.entities.getById(id);

        if (entity) {
            // @ts-ignore: need access to private entity children
            entity._children.forEach((childEntity) => {
                this.dataSource_.entities.remove(childEntity);
            });
            this.dataSource_.entities.remove(entity);
            this.updateDataSource_();
        }
    }

    getFeature(id: string) {
        return this.dataSource_.entities.getById(id);
    }

    hasFeature(id: string) {
        return !!this.getFeature(id);
    }

    getFeatureData(id: string) {
        const feature = this.getFeature(id);
        return feature ? feature[PICK_INFO_KEY].data : undefined;
    }

    removeAllFeatures() {
        this.dataSource_.entities.removeAll();
        this.updateDataSource_();
    }

    shouldReceiveFeatureHoverEvents() {
        return !!this.onFeatureHover_;
    }

    shouldReceiveFeatureSelectEvents() {
        return !!this.onFeatureSelect_;
    }

    onFeatureHover(coordinate: Cartesian3, pickInfo: PickInfo) {
        if (this.onFeatureHover_) {
            const cartographic = Cartographic.fromCartesian(coordinate);
            this.onFeatureHover_(
                {
                    id: pickInfo.id,
                    data: pickInfo.data
                },
                [CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude), cartographic.height]
            );
        }
    }

    onFeatureSelect(coordinate: Cartesian3, pickInfo: PickInfo) {
        if (this.onFeatureSelect_) {
            const cartographic = Cartographic.fromCartesian(coordinate);
            this.onFeatureSelect_(
                {
                    id: pickInfo.id,
                    data: pickInfo.data
                },
                [CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude), cartographic.height]
            );
        }
    }

    getFeaturePickMode() {
        return this.coordPickMode_;
    }

    protected isPickable_(geometryType, style: IFeatureStyle) {
        let pickable: boolean;
        if (geometryType === 'Point' || geometryType === 'MultiPoint') {
            pickable = !style.point?.pickingDisabled;
        } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            pickable = !style.line?.pickingDisabled;
        } else {
            pickable = !style.polygon?.pickingDisabled;
        }
        return pickable;
    }

    protected updateDataSource_() {
        updateDataSource(this.dataSource_, this.mapRenderer_.getViewer().scene);
    }

    protected getGeometryTypeForEntity_(entity: Entity) {
        return entity[ENTITY_GEOMETRY_TYPE_KEY] as GeoJsonGeometryTypes;
    }

    protected getGeometryRendererForEntity_(entity: Entity) {
        return entity[ENTITY_GEOMETRY_RENDERER_KEY] as CesiumGeometryEntityRenderer;
    }
}
