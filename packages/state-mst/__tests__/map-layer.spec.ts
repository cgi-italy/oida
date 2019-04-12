import { types, typecheck, getSnapshot } from 'mobx-state-tree';
import { MapLayer } from '../src/types/layers/map-layer';
import { Entity } from '../src/types/entity/entity';

describe('Map layer type', () => {

    it('Should be an instance of MapEntityType and LayerType', () => {

        const TestLayerType = MapLayer.addModel(
            types.model('TestLayer', {})
        );

        const TestLayer = TestLayerType.create({
            id: 'testLayer'
        });

        expect(() => typecheck(MapLayer.Type, TestLayer)).not.toThrow();
        expect(() => typecheck(Entity.Type, TestLayer)).not.toThrow();

    });
});
