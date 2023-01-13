import { autorun } from 'mobx';
import { v4 as uuid } from 'uuid';

import { DateRangeValue, SortOrder, SubscriptionTracker } from '@oidajs/core';
import { QueryParams } from '@oidajs/state-mobx';

import { DatasetExplorerWorkspace } from './dataset-explorer-workspace-handler';
import {
    DatasetExplorerWorkspaceEntity,
    DatasetExplorerWorkspaceProvider,
    DatasetExplorerWorkspaceProviderConfig
} from './dataset-explorer-workspace-provider';

export const LOCAL_STORAGE_DATASET_EXPLORER_MAP_VIEW_PROVIDER_TYPE = 'local_storage_map_view_provider';

export type LocalStorageDatasetExplorerWorkspaceProviderConfig = Omit<DatasetExplorerWorkspaceProviderConfig, 'type'> & {
    dbKey?: string;
};

export class LocalStorageDatasetExplorerWorkspaceProvider extends DatasetExplorerWorkspaceProvider {
    readonly queryParams: QueryParams;

    protected dbKey_: string;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(config: LocalStorageDatasetExplorerWorkspaceProviderConfig) {
        super({
            ...config,
            type: LOCAL_STORAGE_DATASET_EXPLORER_MAP_VIEW_PROVIDER_TYPE
        });

        this.queryParams = new QueryParams();
        this.dbKey_ = config.dbKey || 'user_map_views';

        this.subscriptionTracker_ = new SubscriptionTracker();

        this.afterInit_();
    }

    isSaveSupported() {
        return true;
    }

    saveWorkspace(workspace) {
        const workspaces = this.getWorkspaces_();
        const viewId = uuid();
        workspaces.unshift({
            id: viewId,
            ...workspace,
            config: {
                ...workspace.config,
                toi: this.serializeToi_(workspace.config.toi)
            }
        });
        localStorage.setItem(this.dbKey_, JSON.stringify(workspaces));
        this.refreshViews_();
        return Promise.resolve(viewId);
    }

    updateWorkspace(workspace) {
        const workspaces = this.getWorkspaces_();
        const viewIdx = workspaces.findIndex((item) => item.id === workspace.id);
        if (viewIdx !== -1) {
            workspaces[viewIdx] = {
                ...workspace,
                config: {
                    ...workspace.config,
                    toi: this.serializeToi_(workspace.config.toi)
                }
            };
            localStorage.setItem(this.dbKey_, JSON.stringify(workspaces));
            this.refreshViews_();
            return Promise.resolve();
        } else {
            return Promise.reject(new Error(`No view with id ${workspace.id} found`));
        }
    }

    deleteWorkspace(workspaceId: number) {
        const workspaces = this.getWorkspaces_();
        const viewIdx = workspaces.findIndex((workspace) => workspace.id === workspaceId);
        if (viewIdx !== -1) {
            workspaces.splice(viewIdx, 1);
            localStorage.setItem(this.dbKey_, JSON.stringify(workspaces));
            this.refreshViews_();
            return Promise.resolve();
        }
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
    }

    protected afterInit_() {
        const viewUpdateDisposer = autorun(() => {
            if (this.active) {
                this.refreshViews_();
            }
        });

        this.subscriptionTracker_.addSubscription(viewUpdateDisposer);
    }

    protected refreshViews_() {
        const { workspaces, total } = this.filterWorkspaces_(this.getWorkspaces_(true));
        this.queryParams.paging.setTotal(total);
        this.workspaces_.replace(workspaces.map((workspace) => new DatasetExplorerWorkspaceEntity(workspace)));
    }

    protected filterWorkspaces_ = (workspaces: DatasetExplorerWorkspace[]) => {
        let filteredViews = workspaces.slice();

        const criteria = this.queryParams.data;

        if (criteria.filters) {
            criteria.filters.forEach((filter) => {
                filteredViews = filteredViews.filter((workspace) => {
                    if (filter.key === 'search') {
                        let match = workspace.name.toLowerCase().search(filter.value.toLowerCase());
                        if (match === -1 && workspace.description) {
                            match = workspace.description.toLocaleLowerCase().search(filter.value.toLowerCase());
                        }
                        return match !== -1;
                    }
                });
            });
        }

        const total = filteredViews.length;

        if (criteria.sortBy) {
            const key = criteria.sortBy.key;
            filteredViews = filteredViews.sort((i1, i2) => {
                if (key === 'name') {
                    return i1.name < i2.name ? -1 : 1;
                }
                return 0;
            });

            if (criteria.sortBy.order === SortOrder.Descending) {
                filteredViews = filteredViews.reverse();
            }
        }
        if (criteria.paging) {
            filteredViews = filteredViews.slice(criteria.paging.offset, criteria.paging.offset + criteria.paging.pageSize);
        }

        return {
            total: total,
            workspaces: filteredViews
        };
    };

    protected getWorkspaces_(forOutput?: boolean): DatasetExplorerWorkspace[] {
        const data = localStorage.getItem(this.dbKey_);
        if (!data) {
            return [];
        }
        try {
            const views = JSON.parse(data);
            if (forOutput) {
                return views.map((view) => {
                    return {
                        ...view,
                        provider: this.id,
                        config: {
                            ...view.config,
                            toi: this.parseToi_(view.config.toi)
                        }
                    };
                });
            } else {
                return views;
            }
        } catch (e) {
            return [];
        }
    }

    protected serializeToi_(toi: Date | DateRangeValue | undefined) {
        if (!toi) {
            return undefined;
        } else if (toi instanceof Date) {
            return toi.toISOString();
        } else {
            return `${toi.start.toISOString()}/${toi.end.toISOString()}`;
        }
    }

    protected parseToi_(toi: string | undefined): Date | DateRangeValue | undefined {
        if (!toi) {
            return undefined;
        } else {
            const dates = toi.split('/');
            if (dates.length === 2) {
                return {
                    start: new Date(dates[0]),
                    end: new Date(dates[1])
                };
            } else {
                return new Date(dates[0]);
            }
        }
    }
}
