import React from 'react';

export type Choice<U> = {
    name: string;
    value: string;
    disabled?: boolean;
    description?: string;
} & U;

export type ChoiceSelectorProps<U = Record<string, never>> = {
    value: string | undefined;
    items: Choice<U>[];
    onSelect: (value: string) => void;
};

export type ChoiceSelectorRenderer<U> = (props: ChoiceSelectorProps<U>) => React.ReactNode;
