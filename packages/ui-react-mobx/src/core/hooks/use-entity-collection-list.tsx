import { IObservableArray } from 'mobx';

import { SelectionMode } from '@oida/core';
import { SelectionManager, IsEntity } from '@oida/state-mobx';
import { DataCollectionItemAction, DataCollectionItemsProps } from '@oida/ui-react-core';

import { useSelector } from './use-selector';

/** The data collection action type */
export type DataCollectionAction<T> = Omit<DataCollectionItemAction, 'callback'> & {
    /** When the condition evaluates to false the action will not be available for the item */
    condition?: (item: T) => boolean;
    callback: (item: T) => (void | Promise<void>);
};

/**
 * {@Link useDataCollectionActions} input props
 */
export type UseDataCollectionActionsProps<T> = {
    entity: T;
    actions: DataCollectionAction<T>[];
};

/**
 * A React hook that given an entity and a set of collection actions will return the list of action binded to the specific entity
 * The actions condition will be re evaluated if relevant entity properties are updated
 */
export const useDataCollectionActions = <T extends Object>(props: UseDataCollectionActionsProps<T>) => {
    return useSelector(() => {
        return props.actions.filter((action) => {
            return action.condition ? action.condition(props.entity) : true;
        }).map((action) => {
            return {
                ...action,
                callback: () => {
                    return action.callback(props.entity);
                }
            } as DataCollectionItemAction;
        });
    }, [props.entity]);
};

/**
 * {@Link useEntityCollectionList} input props
 */
export type UseEntityCollectionListProps<T extends IsEntity> = {
    /** The entity array */
    items?: IObservableArray<T>;
    /** The collection actions */
    actions?: DataCollectionAction<T>[];
    /**
     * If provided it will be used to handle the hovering and selection state of the entities.
     * Otherwise the state will be managed internally
     */
    selectionManager?: SelectionManager;
};

/**
 * A React hook that given an observable array of entities will return a set of properties to be used
 * as input for a {@Link DataCollectionItemsRenderer}. The hook will react to state changes to the
 * underlying items array. It will bind hovering and selection state of each entity to the corresponding
 * item {@Link DataCollectionItemState}
 * @param props The hook input parameters
 * @return properties to be used as input to a {@Link DataCollectionItemsRenderer}
 */
export const useEntityCollectionList = <T extends IsEntity>(props: UseEntityCollectionListProps<T>) => {

    const { items, actions } = props;

    const selectionManager = props.selectionManager || new SelectionManager();

    const itemProps: (DataCollectionItemsProps<T> | undefined) = useSelector(() => {
        if (!items) {
            return;
        }
        return {
            data: items.slice(),
            keyGetter: (entity: T) => entity.id.toString(),
            itemState: (entity: T) => {
                return useSelector(() => {
                    return {
                        hovered: entity.hovered.value,
                        selected: entity.selected.value,
                    };
                }, [entity]);
            },
            itemActions: (entity: T) => {
                return useDataCollectionActions({
                    entity: entity,
                    actions: actions || []
                });
            },
            onHoverAction: (item: T, hovered: boolean) => {
                selectionManager!.setHovered(hovered ? item : undefined);
            },
            onSelectAction: (item: T, mode: SelectionMode) => {
                selectionManager!.selection.modifySelection(item, mode);
            }
        };
    }, [items]);

    return itemProps;
};
