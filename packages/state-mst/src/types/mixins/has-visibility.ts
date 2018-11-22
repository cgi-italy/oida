import { types } from 'mobx-state-tree';

export const hasVisibility = types
    .model('hasVisibility', {
        visible: types.optional(types.boolean, true),
    })
    .actions(self => {
        return {
            setVisible(visible: boolean) {
                self.visible = visible;
            }
        };
    });
