import { LoadingState, SelectionMode } from '@oida/core';


export type DataCollectionItemAction<T> = {
    name: string;
    callback: (item: T) => void;
    icon?: React.ReactNode;
};

export type DataCollectionItemsProps<T> = {
    data: T[];
    getItemKey: (item: T) => string;
    isItemHovered: (item: T) => boolean;
    isItemSelected: (item: T) => boolean;
    getItemActions?: (item: T) => DataCollectionItemAction<T>[];
    getItemIcon?: (item: T) => React.ReactNode;
    itemHOC?: React.ReactNode,
    onHoverAction: (item: T, hovered: boolean) => void;
    onSelectAction: (item:  T, mode: SelectionMode) => void;
    loadingState?: LoadingState;
};

export type DataCollectionItemsRenderer<T> = (props: DataCollectionItemsProps<T>) => React.ReactNode;
