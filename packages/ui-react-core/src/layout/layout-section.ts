import React from 'react';

export type LayoutSectionItem = {
    id: string;
    title: React.ReactNode;
    icon?:  React.ReactNode;
    content: React.ReactNode;
};

export type LayoutSectionProps = {
    components: LayoutSectionItem[];
    activeComponent?: string;
    showComponent: (componentId?: string) => void;
    expanded: boolean;
    setExpanded: (expanded: boolean) => void;
};

export type LayoutSectionRenderer =  (props: LayoutSectionProps) => React.ReactNode;
