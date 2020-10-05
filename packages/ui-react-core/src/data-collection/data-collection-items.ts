import { LoadingState, SelectionMode } from '@oida/core';


export type DataCollectionItemAction<T> = {
    name: string;
    callback: (item: T) => void;
    condition?: (item: T) => boolean;
    content?: React.ReactNode;
    icon?: React.ReactNode;
};

export type DataCollectionItemProps<T> = {
    selected: boolean;
    hovered: boolean;
    icon?: React.ReactNode;
    actions?: DataCollectionItemAction<T>[];
};

export type DataCollectionItemsProps<T> = {
    data: T[];
    keyGetter: (item: T) => string;
    itemSelector: (item: T) => DataCollectionItemProps<T>;
    onHoverAction: (item: T, hovered: boolean) => void;
    onSelectAction: (item:  T, mode: SelectionMode) => void;
    onDefaultAction?: (item: T) => void;
    multiSelect?: boolean;
    loadingState?: LoadingState;
};

