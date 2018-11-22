import { FunctionType, registerFunction } from '../src/types/mst/function-type';
import { types, getSnapshot } from 'mobx-state-tree';

const createTestModel = () => {
    return  types.model({
        theAnswer: FunctionType
    });
};

describe('Custom mobx FunctionType', () => {
    it('Should label anonymous functions', () => {

        let TestModel = createTestModel();

        let myInstance = TestModel.create({
            theAnswer:  new Function('return 42;')
        });

        expect(myInstance.theAnswer['__mst_func_id__']).toBe('func1');
        expect(getSnapshot(myInstance).theAnswer).toBe('func1');
    });

    it('Should use function name for snapshot value', () => {

        let TestModel = createTestModel();

        function theAnswer() {
            return 42;
        }

        let myInstance = TestModel.create({
            theAnswer: theAnswer
        });

        expect(theAnswer['__mst_func_id__']).toBe('theAnswer');
        expect(getSnapshot(myInstance).theAnswer).toBe('theAnswer');
    });

    it('Should retrieve function from snapshot', () => {
        let TestModel = types.model({
            theQuestion: FunctionType
        });

        let myQuestion = () => {
            return 'who knows';
        };

        let myInstance = TestModel.create({
            theQuestion: myQuestion
        });

        let myInstance2 = TestModel.create({
            theQuestion: 'myQuestion'
        });

        expect(myInstance2.theQuestion()).toBe('who knows');

    });

    it('Should use different snapshot value for existing function name', () => {

        let TestModel = createTestModel();

        {
            let myTestFunction = () => {
                return 42;
            };

            let myInstance = TestModel.create({
                theAnswer: myTestFunction
            });

            expect(myTestFunction['__mst_func_id__']).toBe('myTestFunction');
        }

        {
            let myTestFunction = () => {
                return 43;
            };

            let myInstance2 = TestModel.create({
                theAnswer: myTestFunction
            });

            expect(myTestFunction['__mst_func_id__']).toBe('myTestFunction.1');
        }
    });

    it('Should throw for unregistered function', () => {
        let TestModel = createTestModel();

        expect(() => TestModel.create({theAnswer: 'test'})).toThrow();
    });

    it('Should allow manual function registration', () => {
        let myAwesomeFunction = () => {
            return 42;
        };
        registerFunction(myAwesomeFunction);

        let TestModel = createTestModel();

        let myInstance = TestModel.create({
            theAnswer: 'myAwesomeFunction'
        });

        expect(myInstance.theAnswer()).toBe(42);
    });
});
