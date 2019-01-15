import { types, addDisposer, Instance, getSnapshot, resolveIdentifier } from 'mobx-state-tree';

import { MapEntityType, MapEntityReference, createMapEntityReference, resolveMapEntityReference } from './map-entity';
import { hasSelectableItems } from '../mixins/has-selectable-items';

import { SelectionMode } from  '@oida/core';

const MapEntityHovered = types.model({
    hoveredItem: MapEntityReference
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

export const MapEntitySelection = types.compose(
    'MapEntitySelection',
    hasSelectableItems(MapEntityType.getUnion(), {
        referenceType: MapEntityReference,
        idGetter: createMapEntityReference
    }),
    MapEntityHovered
).actions((self) => {
    return {
        afterCreate: () => {
            const selectionObserverDisposer = self.selectedItems.observe((change) => {
                if (change.type === 'splice') {
                    change.added.forEach((item: any) => {
                        item.value.setSelected(true);
                    });

                    change.removed.forEach((item: any) => {
                        let entity = resolveMapEntityReference(item.snapshot);
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

export type IMapEntitySelection = Instance<typeof MapEntitySelection>;
