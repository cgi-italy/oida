import { types } from 'mobx-state-tree';

import { Geometry, getGeometryExtent } from '@oida/core';

let HasGeometryBaseModel = types.model('hasGeometry')
.views((self: any) => {
    return {
        bounds: () => {
            return getGeometryExtent(self.geometry);
        }
    };
});

export const hasGeometry = HasGeometryBaseModel.props({
    geometry: types.frozen<Geometry>()
}).actions((self) => {
    return {
        setGeometry: (geometry: Geometry) => {
            self.geometry = geometry;
        }
    };
});


export const hasGeometryAsGetter = (geometryGetter: (modelInstance, options?) => Geometry) => {
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
