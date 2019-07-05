import React from 'react';

import { types, Instance } from 'mobx-state-tree';

export type SectionItemRenderingConfig = {
    title: React.ReactNode,
    content: React.ReactNode,
    icon?: React.ReactNode,
    props?: {[x: string]: any}
};

export const SectionItem = types.model('SectionItem', {
    id: types.identifier,
}).volatile((self) => (
    {
        content: undefined,
        props: undefined,
        icon: undefined,
        title: undefined,
    } as SectionItemRenderingConfig
)).actions((self) => ({
    setRenderingConfig: (config: SectionItemRenderingConfig) => {
        self.title = config.title;
        if (config.content) {
            self.content = config.content;
        }
        if (config.props) {
            self.props = config.props;
        }
        if (config.icon) {
            self.icon = config.icon;
        }
    }
})).views((self) => ({
    get renderingConfig() {
        return {
            id: self.id,
            title: self.title,
            content: self.content,
            icon: self.icon,
            props: self.props
        };
    }
}));

export type ISectionItem = Instance<typeof SectionItem>;
