import React from 'react';

export type MapNavControlsProps = {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onGoToHome?: () => void;
};

export type MapNavControlsRenderer = (props: MapNavControlsProps) => React.ReactNode;
