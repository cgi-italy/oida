export type MapLayerSwipeControlProps = {
    active: boolean;
    mapTarget: HTMLElement;
    swipePosition: number;
    onSwipePositionChange: (position: number) => void;
    targetLayerId?: string | number;
};

export type MapLayerSwipeControlRenderer = React.ComponentType<MapLayerSwipeControlProps>;
