import { types } from 'mobx-state-tree';

import { IFeatureStyle } from '@oida/core';

const HasStyleBaseModel = types.model('hasStyle');

export const hasStyle = HasStyleBaseModel.props({
    style: types.frozen<IFeatureStyle>()
}).actions((self) => {
    return {
        setStyle: (style: IFeatureStyle) => {
            self.style = style;
        }
    };
});


export const hasStyleAsGetter = (styleGetter: (modelInstance, options?) => IFeatureStyle) => {
    let model = HasStyleBaseModel.views((self) => {
        return {
            get style() {
                return styleGetter(self);
            },
            getStyle: (options) => {
                return styleGetter(self, options);
            }
        };
    });

    return model;
};
