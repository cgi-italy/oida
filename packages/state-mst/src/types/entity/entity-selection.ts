import { types, addDisposer, Instance } from 'mobx-state-tree';

import { EntityType } from './entity';
import { EntitySafeReference, resolveEntityReference } from './entity-reference';
import { hasSelectableItems } from '../mixins/has-selectable-items';

const EntityHovered = types.model({
    hoveredItems: types.array(EntitySafeReference(EntityType))
}).actions((self) => {
    return {
        setHovered: (items) => {
            if (self.hoveredItems.length === 1 && items === self.hoveredItems[0]) {
                return;
            }

            self.hoveredItems.forEach((item) => {
                item.setHovered(false);
            });

            //@ts-ignore
            self.hoveredItems = Array.isArray(items) ? items : (items ? [items] : []);
            if (self.hoveredItems) {
                self.hoveredItems.forEach((item) => {
                    item.setHovered(true);
                });
            }
        },
        beforeDestroy: () => {
            self.hoveredItems.forEach((item) => {
                item.setHovered(false);
            });
        }
    };
});

const EntitySelectionDecl = types.compose(
    'EntitySelection',
    hasSelectableItems(EntityType, EntitySafeReference(EntityType)),
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

type EntitySelectionType = typeof EntitySelectionDecl;
export interface EntitySelectionInterface extends EntitySelectionType {}
export const EntitySelection: EntitySelectionInterface = EntitySelectionDecl;
export interface IEntitySelection extends Instance<EntitySelectionInterface> {}

