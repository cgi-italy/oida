import { types } from 'mobx-state-tree';

export const isSelectable = types
    .model('isSelectable', {
        selected: types.optional(types.boolean, false),
    })
    .actions(self => {
        return {
            setSelected(selected: boolean) {
                self.selected = selected;
            }
        };
    });
