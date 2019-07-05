import React from 'react';

export type ComponentPaneItem = {
    id: string;
    title: React.ReactNode;
    icon?:  React.ReactNode;
    content: React.ReactNode;
};

export type ComponentPaneProps = {
    components: ComponentPaneItem[];
    activeComponent?: string;
    showComponent: (componentId?: string) => void;
};

export type ComponentPaneRenderer =  (props: ComponentPaneProps) => React.ReactNode;
