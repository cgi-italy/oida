import { types } from 'mobx-state-tree';

export const isHoverable = types
    .model('isHoverable', {
        hovered: types.optional(types.boolean, false),
    })
    .actions(self => {
        return {
            setHovered(hovered) {
                self.hovered = hovered;
            }
        };
    });
