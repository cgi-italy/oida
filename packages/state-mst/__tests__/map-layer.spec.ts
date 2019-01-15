import { types, typecheck, getSnapshot } from 'mobx-state-tree';
import { LayerType } from '../src/types/layers/map-layer';
import { MapEntityType } from '../src/types/map/map-entity';

describe('Map layer type', () => {

    it('Should be an instance of MapEntityType and LayerType', () => {

        const TestLayerType = LayerType.addType('testType', types.model('TestLayer', {}));

        const layer = TestLayerType.create({
            id: 'testLayer'
        });

        expect(() => typecheck(LayerType.getUnion(), layer)).not.toThrow();
        expect(() => typecheck(MapEntityType.getUnion(), layer)).not.toThrow();

    });
});
