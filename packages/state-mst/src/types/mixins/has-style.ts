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
    let model = HasStyleBaseModel
    .volatile((self) => ({
        styleGetter: styleGetter
    })).actions((self) => {
        return {
            setStyleGetter: (styleGetter) => {
                self.styleGetter = styleGetter;
            }
        };
    }).views((self) => {
        return {
            get style() {
                return self.styleGetter(self);
            },
            getStyle: (options) => {
                return styleGetter(self, options);
            }
        };
    });

    return model;
};
