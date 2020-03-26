import { geometryEntityRendererFactory } from './cesium-geometry-entity-renderer-factory';
import { pointEntityRenderer, multiPointEntityRenderer } from './cesium-point-entity-renderer';
import { lineEntityRenderer, multiLineEntityRenderer } from './cesium-line-entity-renderer';
import { polygonEntityRenderer, multiPolygonEntityRenderer } from './cesium-polygon-entity-renderer';
import { bboxEntityRenderer } from './cesium-bbox-entity-renderer';

geometryEntityRendererFactory.register('Point', () => pointEntityRenderer);
geometryEntityRendererFactory.register('MultiPoint', () => multiPointEntityRenderer);
geometryEntityRendererFactory.register('LineString', () => lineEntityRenderer);
geometryEntityRendererFactory.register('MultiLineString', () => multiLineEntityRenderer);
geometryEntityRendererFactory.register('Polygon', () => polygonEntityRenderer);
geometryEntityRendererFactory.register('MultiPolygon', () => multiPolygonEntityRenderer);
geometryEntityRendererFactory.register('BBox', () => bboxEntityRenderer);

export { geometryEntityRendererFactory };

