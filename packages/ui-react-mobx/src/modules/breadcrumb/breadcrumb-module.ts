import { autorun } from 'mobx';

import { IndexedCollection } from '@oida/state-mobx';
import { BreadcrumbItemProps } from '@oida/ui-react-core';

import { AppModule } from '../app-module';


export const DEFAULT_BREADCRUMB_MODULE_ID = 'breadcrumb';

export type BreadcrumbModuleConfig = {
    pageTitle: string
};

export type BreadcrumbModuleProps = {
    config: BreadcrumbModuleConfig;
    id?: string
};

export class BreadcrumbModule extends AppModule {

    readonly config: BreadcrumbModuleConfig;
    readonly breadcrumb: IndexedCollection<BreadcrumbItemProps>;

    constructor(props: BreadcrumbModuleProps) {
        super({
            id: props.id || DEFAULT_BREADCRUMB_MODULE_ID
        });
        this.config = props.config;
        this.breadcrumb = new IndexedCollection({
            idGetter: (item) => item.key
        });

        this.afterInit_();
    }

    afterInit_() {
        autorun(() => {
            let title = this.breadcrumb.items.reduce((title, breadcrumbItem) => {
                return `${title} - ${breadcrumbItem.title}`;
            }, this.config.pageTitle);
            document.title = title;
        });
    }
}
