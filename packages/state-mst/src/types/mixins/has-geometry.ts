import { types } from 'mobx-state-tree';

let HasGeometryBaseModel = types.model('hasGeometry')
.views((self: any) => {
    return {
        bounds: () => {

        }
    };
});

export const hasGeometry = HasGeometryBaseModel.props({
    geometry: types.frozen()
}).actions((self) => {
    return {
        setGeometry: (geometry) => {
            self.geometry = geometry;
        }
    };
});


export const hasGeometryAsGetter = (geometryGetter: (modelInstance, options?) => any) => {
    let model = HasGeometryBaseModel.views((self) => {
        return {
            get geometry() {
                return geometryGetter(self);
            },
            getGeometry: (options) => {
                return geometryGetter(self, options);
            }
        };
    });

    return model;
};
