import { types } from 'mobx-state-tree';

export const isActivable = types
    .model('isActivable', {
        active: types.optional(types.boolean, true),
    })
    .actions(self => {
        return {
            setActive(active: boolean) {
                self.active = active;
            }
        };
    });
