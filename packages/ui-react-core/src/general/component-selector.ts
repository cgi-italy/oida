import React from 'react';

export type ComponentSelectorItem = {
    id: string;
    title: React.ReactNode;
    icon?:  React.ReactNode;
    content: React.ReactNode;
};

export type ComponentSelectorProps = {
    components: ComponentSelectorItem[];
    activeChild?: string;
    onChildActivation: (string) => void;
};

export type ComponentSelectorRenderer =  (props: ComponentSelectorProps) => React.ReactNode;
