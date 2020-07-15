import { types, Instance } from 'mobx-state-tree';

export const hasDimensionsDecl = types.model('hasDimensions', {
    dimensionValues: types.map(types.union(types.string, types.number, types.Date))
}).actions((self) => {
    return {
        setDimensionValue: (dimension: string, value?: string | number | Date) => {
            if (value) {
                self.dimensionValues.set(dimension, value);
            } else {
                self.dimensionValues.delete(dimension);
            }
        },
    };
}).preProcessSnapshot((s) => {
    let dimensionValues = {
        ...s.dimensionValues
    };

    for (let id in dimensionValues) {
        if (id === 'time') {
            dimensionValues[id] = new Date(dimensionValues[id]);
        }
    }
    return {
        ...s,
        dimensionValues: dimensionValues
    };
});

type HasDimensionsType = typeof hasDimensionsDecl;
export interface HasDimensionsInterface extends HasDimensionsType { }
export const hasDimensions: HasDimensionsInterface = hasDimensionsDecl;
export interface IHasDimensions extends Instance<HasDimensionsInterface> { }
