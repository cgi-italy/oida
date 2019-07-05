import { types, Instance } from 'mobx-state-tree';

export const BreadcrumbItemModel = types.model('BreadcrumbItem', {
    key: types.identifier,
    title: types.string,
    link: types.maybe(types.string)
}).volatile((self) => {
    return {
        onClick: undefined as (() => void) | undefined
    };
})
.actions((self) => {
    return {
        update: (data) => {
            self.title = data.title || self.title || self.link;
            self.link = data.link || self.link;
            self.onClick = data.onClick || self.onClick;
        }
    };
});

export type IBreadcrumbItem = Instance<typeof BreadcrumbItemModel>;
