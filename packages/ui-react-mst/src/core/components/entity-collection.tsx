import React from 'react';

import { observer, Observer } from 'mobx-react';

import { LoadingState } from '@oida/core';
import { IEntitySelection, IEntityCollection, IEntity, IDataPaging, IDataSorting, IDataFilters } from '@oida/state-mst';
import { DataCollectionRenderer, DataSortField, DataCollectionItemAction, AnyFormFieldDefinition, AsyncImage } from '@oida/ui-react-core';

import { getPagerPropsFromState } from './data-pager';
import { getSorterPropsFromState } from './data-sorter';
import { getFiltererPropsFromState } from './data-filterer';

type EntityUserAction<T> = {
    condition?: (entity: T) => boolean;
} & DataCollectionItemAction<T>;

export type EntityCollectionProps<T extends IEntity> = {
    collection: IEntityCollection;
    loadingState: LoadingState;
    entitySelection?: IEntitySelection;
    iconGetter?: (entity: T) => string | Promise<string>;
    userActions?: EntityUserAction<T>[],
    paging?: IDataPaging
    sorting?: {
        state: IDataSorting,
        fields: DataSortField[]
    },
    filtering?: {
        state: IDataFilters,
        filters: Array<AnyFormFieldDefinition>
    },
    render: DataCollectionRenderer<T>;
    needsDereference?: boolean;
};

class EntityCollectionBase<T extends IEntity = IEntity>
    extends React.Component<EntityCollectionProps<T>> {

    private onSelectAction_;

    constructor(props: EntityCollectionProps<T>) {
        super(props);

        if (!props.entitySelection) {
            let selectedId = null;
            this.onSelectAction_ = (item, mode) => {
                if (selectedId) {
                    let selected = this.props.collection.itemWithId(selectedId);
                    if (selected) {
                        selected.setSelected(false);
                    }
                }
                item.setSelected(true);
                selectedId = item.id;
            };
        } else {
            this.onSelectAction_ = (item, mode) => {
                props.entitySelection.modifySelection(item, mode);
            };
        }
    }
    render() {
        let {
            render, collection, loadingState, entitySelection, iconGetter, userActions,
            paging, sorting, filtering, needsDereference
        } = this.props;

        if (needsDereference) {
            let items = collection.items.map((item) => {
                return {
                    ...item
                };
            });
        }

        return (
            render({
                items: {
                    data: collection.items as unknown as T[],
                    getItemKey: (item) => item.id,
                    isItemSelected: (item) => item.selected,
                    isItemHovered: (item) => item.hovered,
                    getItemIcon: (item) => {
                        let iconSrc = iconGetter ? iconGetter(item) : null;
                        if (iconSrc) {
                            return <AsyncImage imageUrl={iconSrc}></AsyncImage>;
                        }
                    },
                    getItemActions: (item) => {
                        return userActions ? userActions.filter((action) => action.condition ? action.condition(item) : true) : [];
                    },
                    loadingState: loadingState,
                    onHoverAction: (item, hovered) => {
                        if (entitySelection) {
                            entitySelection.setHovered(hovered ? item : null);
                        } else {
                            item.setHovered(hovered);
                        }
                    },
                    itemHOC: Observer,
                    onSelectAction: this.onSelectAction_
                },
                paging: getPagerPropsFromState(paging),
                sorting: getSorterPropsFromState(sorting.fields, sorting.state),
                filters: getFiltererPropsFromState(filtering.filters, filtering.state)
            })
        );
    }
}

export const EntityCollection = observer(EntityCollectionBase);
