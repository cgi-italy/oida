import { types } from 'mobx-state-tree';

export const hasOpacity = types
    .model('hasOpacity', {
        opacity: types.optional(types.number, 1.0),
    })
    .actions(self => {
        return {
            setOpacity(opacity) {
                self.opacity = opacity;
            }
        };
    });
