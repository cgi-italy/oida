import { LoadingState, SelectionMode } from '@oidajs/core';

/** Data collection item action */
export type DataCollectionItemAction = {
    /**
     * The callback invoked when the action is selected.
     * If the callback returns a promise the action will be disabled until the promise completes.
     */
    callback: () => void | Promise<void>;
    /** The action content */
    content?: React.ReactNode;
    /** An icon to display */
    icon?: React.ReactNode;
    /** The action title. Usually displayed as a tooltip */
    title?: string;
    /** A flag indicating if this is a primary action */
    primary?: boolean;
};

/** Data collection item selection state */
export type DataCollectionItemState = {
    selected: boolean;
    hovered: boolean;
};

/** {@link DataCollectionItemsRenderer} component input properties*/
export type DataCollectionItemsProps<T> = {
    /** The data array */
    data: T[];
    /** A function that extract a unique identifier for a data item */
    keyGetter: (item: T) => string;
    /** A function that given an item return its current state (hovering and selection) */
    itemState: (item: T) => DataCollectionItemState;
    /** Callback invoked when an item of the collection is mouse hovered */
    onHoverAction: (item: T, hovered: boolean) => void;
    /** Callback invoked when an item of the collection is selected (e.g. mouse click) */
    onSelectAction: (item: T, mode: SelectionMode) => void;
    /** Callback invoked when the default action (e.g. double click) is performed on an item */
    onDefaultAction?: (item: T) => void;
    /** A function that given an item return the list of actions available for the item */
    itemActions?: (item: T) => DataCollectionItemAction[];
    /** File drop callbacks */
    fileDropProps?: {
        /** Given an item returns a flag indicating if a file can be dropped on the item */
        canDrop: (item: T) => boolean;
        /** Invoked when a file is dropped over a collection item */
        onDrop: (item: T, files: File[]) => void;
    };
    /** A flag indicating if multiple items can be selected at the same time */
    multiSelect?: boolean;
    /** The loading state of the collection items */
    loadingState?: LoadingState;
};

/**
 * A component that render a list of items, with support for hovering/selection, file drop and item actions
 */
export type DataCollectionItemsRenderer<T> = React.ComponentType<DataCollectionItemsProps<T>>;
