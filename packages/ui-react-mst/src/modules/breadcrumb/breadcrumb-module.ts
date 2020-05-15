import { autorun } from 'mobx';
import { types, Instance, addDisposer } from 'mobx-state-tree';

import { IndexedCollection, hasConfig } from '@oida/state-mst';
import { BreadcrumbItemModel } from './types';

import { AppModule, AppModuleStateModel } from '../app-module';

export type BreadcrumbModuleConfig = {
    pageTitle: string;
};

const BreadcrumbModuleStateModelDecl = AppModuleStateModel.addModel(
    types.compose(
        'BreadcrumbModule',
        IndexedCollection(BreadcrumbItemModel, (id, collection) => collection.items.find((item) => item.key === id)),
        hasConfig<BreadcrumbModuleConfig>()
    ).actions((self) => {
        return {
            afterAttach: () => {
                const titleUpdateDisposer = autorun(() => {
                    let title = self.items.reduce((title, breadcrumbItem) => {
                        return `${title} - ${breadcrumbItem.title}`;
                    }, self.config.pageTitle);
                    document.title = title;
                });

                addDisposer(self, titleUpdateDisposer);
            }
        };
    })
);


type BreadcrumbModuleStateModelType = typeof BreadcrumbModuleStateModelDecl;
export interface BreadcrumbModuleStateModelInterface extends BreadcrumbModuleStateModelType {}
export const BreadcrumbModuleStateModel: BreadcrumbModuleStateModelInterface = BreadcrumbModuleStateModelDecl;
export interface IBreadcrumbModuleStateModel extends Instance<BreadcrumbModuleStateModelInterface> {}

export type BreadcrumbModule = AppModule<BreadcrumbModuleStateModelInterface>;

export const DefaultBreadcrumbModule: BreadcrumbModule = {
    stateModel: BreadcrumbModuleStateModel,
    defaultInitState: {
        id: 'breadcrumb',
        config: {
            pageTitle: 'My app'
        }
    }
};

