import { types, Instance } from 'mobx-state-tree';

export const BreadcrumbItem = types.model('BreadcrumbItem', {
    key: types.identifier,
    title: types.string,
    link: types.maybe(types.string)
}).actions((self) => {
    return {
        update: (data) => {
            self.title = data.title || self.link;
            self.link = data.link || self.link;
        }
    };
});

export type IBreadcrumbItem = Instance<typeof BreadcrumbItem>;
