import { types, typecheck } from 'mobx-state-tree';
import { TaggedUnion } from '../src/types/mst/tagged-union';

describe('Tagged union type', () => {

    it('Registered models instances should be instances of the union', () => {

        let Shape = TaggedUnion('type', types.model({
            centerX: types.number,
            centerY: types.number
        }));

        let Square = Shape.addModel(types.model(
            'square',
            {
                side: types.number
            }
        ));

        let mySquare = Square.create({
            centerX: 3,
            centerY: 4,
            side: 2
        });

        expect(() => typecheck(Square, mySquare)).not.toThrow();
        expect(() => typecheck(Shape.Type, mySquare)).not.toThrow();
    });

    it('Should set tag on instance creation', () => {
        let Shape = TaggedUnion('type', types.model({
            centerX: types.number,
            centerY: types.number
        }));

        let Square = Shape.addModel(types.model(
            'square',
            {
                side: types.number
            }
        ));

        let mySquare = Square.create({
            centerX: 3,
            centerY: 4,
            side: 2
        });

        expect(mySquare.type).toBe('square');
    });

    it('Should throw when trying to register an anonymous model', () => {

        let Shape = TaggedUnion('type', types.model({
            centerX: types.number,
            centerY: types.number
        }));

        expect(() => {
            Shape.addModel(types.model({
                side: types.number
            }));
        }).toThrow();
    });

    it('Should allow registration of sub union', () => {
        let Shape = TaggedUnion('type', types.model({
            centerX: types.number,
            centerY: types.number
        }));

        let Triangle = Shape.addUnion('triangleType', types.model(
            'triangle',
            {

            }
        ));

        let IsoscelesTriangle = Triangle.addModel(types.model('isosceles', {
            base: types.number,
            height: types.number
        }));

        let myTriangle = IsoscelesTriangle.create({
            centerX: 22,
            centerY: 33,
            base: 5,
            height: 12
        });

        expect(() => typecheck(IsoscelesTriangle, myTriangle)).not.toThrow();
        expect(() => typecheck(Triangle.Type, myTriangle)).not.toThrow();
        expect(() => typecheck(Shape.Type, myTriangle)).not.toThrow();

        expect(myTriangle.type).toBe('triangle');
        expect(myTriangle.triangleType).toBe('isosceles');
    });

    it('Should return sub type by name', () => {
        let Shape = TaggedUnion('type', types.model({
            centerX: types.number,
            centerY: types.number
        }));

        let Square = Shape.addModel(types.model(
            'square',
            {
                side: types.number
            }
        ));

        expect(Shape.getSpecificType('square')).toBe(Square);
    });
});
