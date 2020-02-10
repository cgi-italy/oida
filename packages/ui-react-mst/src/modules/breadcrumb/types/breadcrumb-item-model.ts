import { types, Instance } from 'mobx-state-tree';

const BreadcrumbItemModelDecl = types.model('BreadcrumbItem', {
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

type BreadcrumbItemModelType = typeof BreadcrumbItemModelDecl;
export interface BreadcrumbItemModelInterface extends BreadcrumbItemModelType {}
export const BreadcrumbItemModel: BreadcrumbItemModelInterface = BreadcrumbItemModelDecl;
export interface IBreadcrumbItemModel extends Instance<BreadcrumbItemModelInterface> {}

