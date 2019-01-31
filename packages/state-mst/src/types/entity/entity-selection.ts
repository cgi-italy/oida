import { types, addDisposer, Instance, getSnapshot, resolveIdentifier, IAnyModelType } from 'mobx-state-tree';

import { Entity } from './entity';
import { EntityReference, createEntityReference, resolveEntityReference } from './entity-reference';
import { hasSelectableItems } from '../mixins/has-selectable-items';

import { SelectionMode } from  '@oida/core';

const EntityHovered = types.model({
    hoveredItem: EntityReference
}).actions((self) => {
    return {
        setHovered: (item) => {
            if (self.hoveredItem) {
                self.hoveredItem.setHovered(false);
            }
            self.hoveredItem = item || undefined;
            if (self.hoveredItem) {
                self.hoveredItem.setHovered(true);
            }
        },
        beforeDestroy: () => {
            if (self.hoveredItem) {
                self.hoveredItem.setHovered(false);
            }
        }
    };
});

export const EntitySelection = types.compose(
    'EntitySelection',
    hasSelectableItems(Entity as IAnyModelType, {
        referenceType: EntityReference,
        idGetter: createEntityReference
    }),
    EntityHovered,
    types.model({
        id: types.identifier
    })
).actions((self) => {
    return {
        afterCreate: () => {
            const selectionObserverDisposer = self.selectedItems.observe((change) => {
                if (change.type === 'splice') {
                    change.added.forEach((item: any) => {
                        item.value.setSelected(true);
                    });

                    change.removed.forEach((item: any) => {
                        let entity = resolveEntityReference(item.snapshot, self);
                        if (entity) {
                            entity.setSelected(false);
                        }
                    });
                } else if (change.type === 'update') {
                    change.oldValue.setSelected(false);
                    change.newValue.setSelected(true);
                }
            });

            addDisposer(self, selectionObserverDisposer);
        }
    };
});

export type IEntitySelection = Instance<typeof EntitySelection>;
