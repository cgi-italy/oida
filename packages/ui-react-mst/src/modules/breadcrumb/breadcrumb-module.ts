import { autorun } from 'mobx';
import { Instance, addDisposer } from 'mobx-state-tree';

import { IndexedCollection } from '@oida/state-mst';
import { BreadcrumbItem } from './types/breadcrumb-item';

import { AppModule, AppModuleStateModel } from '../app-module';

export const BreadcrumbModuleStateModel = AppModuleStateModel.addModel(
    IndexedCollection(BreadcrumbItem, (id, collection) => collection.items.find((item) => item.key === id)).actions((self) => {
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

export type BreadcrumbModule = AppModule<typeof BreadcrumbModuleStateModel, BreadcrumbModuleConfig>;
export const DefaultBreadcrumbModule: BreadcrumbModule = {
    stateModel: BreadcrumbModuleStateModel,
    defaultInitState: {
        id: 'breadcrumb'
    }
};

export type IBreadcrumbModuleStateModel = Instance<typeof BreadcrumbModuleStateModel>;
