import { createDynamicFactory } from '../src/utils/dynamic-factory';

let testFactory;

describe('Dynamic factory', () => {

    beforeEach(() => {
        testFactory = createDynamicFactory('beers');
    });

    it('Should allow registeration of new factory', () => {

        testFactory.register('stout', () => {
            return {
                name: 'Stout',
                origin: 'London'
            };
        });

        expect(testFactory.isRegistered('stout')).toBeTruthy();
    });

    it('Should create object from registered factory function', () => {

        testFactory.register('lambic', (config) => {
            return {
                name: 'Lambic',
                origin: 'Payottenland',
                brewery: config.brewery
            };
        });

        expect(testFactory.create('lambic', ({brewery: 'Cantillion'}))).toEqual({
            name: 'Lambic',
            origin: 'Payottenland',
            brewery: 'Cantillion'
        });
    });

    it('Should throw when try to register with an existing id', () => {

        testFactory.register('gose', () => {
            return {
                name: 'Gose',
                origin: 'Lipsia'
            };
        });

        expect(() => testFactory.register('gose', () => {
            return {
                name: 'Refused gose',
                origin: 'India'
            };
        })).toThrow();

    });

    it('Should return undefined for unregistered id', () => {
        expect(testFactory.create('lager')).toBeUndefined();
    });
});
