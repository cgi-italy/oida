import React from 'react';

export type LayoutSectionItem = {
    id: string;
    title: React.ReactNode;
    icon?: React.ReactNode;
    content: React.ReactNode;
    onClose?: () => void;
    onRename?: (name: string) => void;
};

export type LayoutSectionProps = {
    components: LayoutSectionItem[];
    activeComponent?: string;
    showComponent: (componentId?: string) => void;
    expanded: boolean;
    setExpanded: (expanded: boolean) => void;
};

export type LayoutSectionRenderer = (props: LayoutSectionProps) => React.ReactNode;
