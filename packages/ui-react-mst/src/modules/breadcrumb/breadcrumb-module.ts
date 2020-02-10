import { autorun } from 'mobx';
import { Instance, addDisposer } from 'mobx-state-tree';

import { IndexedCollection } from '@oida/state-mst';
import { BreadcrumbItemModel } from './types';

import { AppModule, AppModuleStateModel } from '../app-module';

const BreadcrumbModuleStateModelDecl = AppModuleStateModel.addModel(
    IndexedCollection(BreadcrumbItemModel, (id, collection) => collection.items.find((item) => item.key === id)).actions((self) => {
        return {
            afterAttach: () => {
                const titleUpdateDisposer = autorun(() => {
                    let title = self.items.reduce((title, breadcrumbItem) => {
                        return `${title} - ${breadcrumbItem.title}`;
                    }, (self as any).config.pageTitle);
                    document.title = title;
                });

                addDisposer(self, titleUpdateDisposer);
            }
        };
    })
);

export type BreadcrumbModuleConfig = {
    pageTitle: string;
};

type BreadcrumbModuleStateModelType = typeof BreadcrumbModuleStateModelDecl;
export interface BreadcrumbModuleStateModelInterface extends BreadcrumbModuleStateModelType {}
export const BreadcrumbModuleStateModel: BreadcrumbModuleStateModelInterface = BreadcrumbModuleStateModelDecl;
export interface IBreadcrumbModuleStateModel extends Instance<BreadcrumbModuleStateModelInterface> {}

export type BreadcrumbModule = AppModule<BreadcrumbModuleStateModelInterface, BreadcrumbModuleConfig>;

export const DefaultBreadcrumbModule: BreadcrumbModule = {
    stateModel: BreadcrumbModuleStateModel,
    defaultInitState: {
        id: 'breadcrumb'
    }
};

