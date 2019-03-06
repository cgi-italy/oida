import { autorun } from 'mobx';
import { Instance, addDisposer } from 'mobx-state-tree';

import { IndexedCollection } from '@oida/state-mst';
import { BreadcrumbItem } from './types/breadcrumb-item';

import { registerAppModule } from '../app-module';

export const BREADCRUMB_MODULE_DEFAULT_ID = 'breadcrumb';

export const BreadcrumbModule = registerAppModule(
    IndexedCollection(BreadcrumbItem).actions((self) => {
        return {
            afterAttach: () => {
                const titleUpdateDisposer = autorun(() => {
                    let title = self.items.reduce((title, breadcrumbItem) => {
                        return `${title} - ${breadcrumbItem.title}`;
                    }, (self as any).env.title);
                    document.title = title;
                });

                addDisposer(self, titleUpdateDisposer);
            }
        };
    }),
    BREADCRUMB_MODULE_DEFAULT_ID,
    (config) => {
        return {
            title: config.pageTitle
        };
    }
);

export type IBreadcrumb = Instance<typeof BreadcrumbModule>;
