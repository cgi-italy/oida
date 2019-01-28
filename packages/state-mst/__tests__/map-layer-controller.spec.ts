import { types } from 'mobx-state-tree';
import { IMapRenderer, ILayerRenderer } from '@oida/core';

import { MapLayerController } from '../src/controllers/layers/map-layer-controller';
import { MapLayer } from '../src/types/layers/map-layer';

const MapRendererMock = jest.fn<IMapRenderer>();


const LayerRendererMock = jest.fn(() => ({
    setVisible: jest.fn(),
    setOpacity: jest.fn(),
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
        expect(layerRendererMockInstance.setVisible).toBeCalledTimes(1);

        layerRendererMockInstance.setOpacity.mockClear();
        mapLayer.setOpacity(0.5);
        expect(layerRendererMockInstance.setOpacity).toBeCalledTimes(1);
    });

    it('Should destroy layer renderer on map render change', () => {
        let mapLayer = TestLayer.create({
            id: 'test'
        });
        let mapLayerController = new MapLayerControllerImpl({
            mapLayer: mapLayer
        });

        mapLayerController.setMapRenderer(mapRendererMockInstance);

        mapLayerController.setMapRenderer(null);
        expect(layerRendererMockInstance.destroy).toBeCalledTimes(1);

        layerRendererMockInstance.setVisible.mockClear();
        layerRendererMockInstance.setOpacity.mockClear();
        mapLayer.setVisible(false);
        mapLayer.setOpacity(0.5);
        expect(layerRendererMockInstance.setVisible).not.toBeCalled();
        expect(layerRendererMockInstance.setOpacity).not.toBeCalled();
    });

});
