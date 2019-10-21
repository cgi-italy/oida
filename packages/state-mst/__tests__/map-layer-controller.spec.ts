import { types } from 'mobx-state-tree';
import { IMapRenderer, ILayerRenderer } from '@oida/core';

import { MapLayerController } from '../src/controllers/layers/map-layer-controller';
import { MapLayer } from '../src/types/layers/map-layer';

const MapRendererMock = jest.fn();


const LayerRendererMock = jest.fn(() => ({
    setVisible: jest.fn(),
    setOpacity: jest.fn(),
    setZIndex: jest.fn(),
    setExtent: jest.fn(),
    destroy: jest.fn()
}));

const TestLayer = MapLayer.addModel(types.model('TestLayer', {}));

const layerRendererMockInstance = new LayerRendererMock();
const mapRendererMockInstance = new MapRendererMock();

class MapLayerControllerImpl extends MapLayerController {
    createLayerRenderer_(mapRenderer) {
        return <ILayerRenderer>layerRendererMockInstance;
    }
}


describe('MapLayerController', () => {
    it('Should create layer renderer when map renderer is set', () => {
        let mapLayer = TestLayer.create({
            id: 'test'
        });
        let mapLayerController = new MapLayerControllerImpl({
            mapLayer: mapLayer
        });

        const spy = jest.spyOn(mapLayerController, 'createLayerRenderer_');

        mapLayerController.setMapRenderer(mapRendererMockInstance);

        expect(spy).toBeCalledWith(mapRendererMockInstance);

    });

    it('Should react to layer state changes', () => {
        let mapLayer = TestLayer.create({
            id: 'test'
        });
        let mapLayerController = new MapLayerControllerImpl({
            mapLayer: mapLayer
        });

        mapLayerController.setMapRenderer(mapRendererMockInstance);


        layerRendererMockInstance.setVisible.mockClear();
        mapLayer.setVisible(false);
        expect(layerRendererMockInstance.setVisible).toBeCalledWith(false);

        layerRendererMockInstance.setOpacity.mockClear();
        mapLayer.setOpacity(0.5);
        expect(layerRendererMockInstance.setOpacity).toBeCalledWith(0.5);

        layerRendererMockInstance.setZIndex.mockClear();
        mapLayer.setZIndex(10);
        expect(layerRendererMockInstance.setZIndex).toBeCalledWith(10);

        layerRendererMockInstance.setExtent.mockClear();
        mapLayer.setExtent([-20, -40, 20, 40]);
        expect(layerRendererMockInstance.setExtent).toBeCalledWith([-20, -40, 20, 40]);
    });

    it('Should destroy layer renderer on map render change', () => {
        let mapLayer = TestLayer.create({
            id: 'test'
        });
        let mapLayerController = new MapLayerControllerImpl({
            mapLayer: mapLayer
        });

        mapLayerController.setMapRenderer(mapRendererMockInstance);

        mapLayerController.setMapRenderer(undefined);
        expect(layerRendererMockInstance.destroy).toBeCalledTimes(1);

        layerRendererMockInstance.setVisible.mockClear();
        layerRendererMockInstance.setOpacity.mockClear();
        mapLayer.setVisible(false);
        mapLayer.setOpacity(0.5);
        expect(layerRendererMockInstance.setVisible).not.toBeCalled();
        expect(layerRendererMockInstance.setOpacity).not.toBeCalled();
    });

});
