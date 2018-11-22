import { types, typecheck } from 'mobx-state-tree';
import { DynamicUnion } from '../src/types/mst/dynamic-union';

describe('Dynamic union type', () => {

    it('Should allow registration of new type', () => {
        let testTypeFactory = DynamicUnion('testType', (testModel) => {
            return testModel;
        });

        let dynamicType = testTypeFactory.addType('test1', types.model({
            test: types.string
        }));

        let typeInstance = dynamicType.create({
            test: 'test'
        });

        expect(typeInstance.testType).toBe('test1');
        expect(() => typecheck(testTypeFactory.getUnion(), typeInstance)).not.toThrow();

    });
});
