import React from 'react';

import { observer, Observer } from 'mobx-react';

import { LoadingState } from '@oida/core';
import { IHasSelectableItems, IMapEntityCollection, IMapEntity, IDataPaging, IDataSorting } from '@oida/state-mst';
import { DataCollectionRenderer, DataSortField } from '@oida/ui-react-core';

import { getPagerPropsFromState } from '../../core/components/data-pager';
import { getSorterPropsFromState } from '../../core/components/data-sorter';

export type MapEntityCollectionProps<T extends IMapEntity, S extends IHasSelectableItems = IHasSelectableItems> = {
    collection: IMapEntityCollection;
    loadingState: LoadingState;
    selectionHandler?: S;
    hoverHandler?;
    paging?: IDataPaging
    sorting?: {
        state: IDataSorting,
        fields: DataSortField[]
    }
    render: DataCollectionRenderer<T>;
    needsDereference?: boolean;
};

class MapEntityCollectionBase<T extends IMapEntity = IMapEntity, S extends IHasSelectableItems = IHasSelectableItems>
    extends React.Component<MapEntityCollectionProps<T, S>> {

    private onSelectAction_;

    constructor(props: MapEntityCollectionProps<T, S>) {
        super(props);

        if (!props.selectionHandler) {
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
                props.selectionHandler.modifySelection(item, mode);
            };
        }
    }
    render() {
        let {render, collection, loadingState, hoverHandler, paging, sorting, needsDereference} = this.props;

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
                    data: collection.items,
                    getItemKey: (item) => item.id,
                    isItemSelected: (item) => item.selected,
                    isItemHovered: (item) => item.hovered,
                    loadingState: loadingState,
                    onHoverAction: (item, hovered) => {
                        if (hoverHandler) {
                            hoverHandler.setHovered(hovered ? item : null);
                        } else {
                            item.setHovered(hovered);
                        }
                    },
                    itemHOC: Observer,
                    onSelectAction: this.onSelectAction_
                },
                paging: getPagerPropsFromState(paging),
                sorting: getSorterPropsFromState(sorting.fields, sorting.state)
            })
        );
    }
}

export const MapEntityCollection = observer(MapEntityCollectionBase);
