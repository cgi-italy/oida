import { Entity } from '@oidajs/state-mobx';
import { action, IObservableArray, makeObservable, observable } from 'mobx';
import { DatasetExplorerWorkspace } from './dataset-explorer-workspace-handler';

export class DatasetExplorerWorkspaceEntity<T extends DatasetExplorerWorkspace = DatasetExplorerWorkspace> extends Entity {
    readonly metadata: T;

    constructor(metadata: T) {
        super({
            id: metadata.id,
            entityType: 'dataset_explorer_map_view'
        });

        this.metadata = metadata;
    }
}

export type DatasetExplorerWorkspaceProviderConfig = {
    id: string;
    type: string;
    name: string;
    description?: string;
    active?: boolean;
};

export abstract class DatasetExplorerWorkspaceProvider<T extends DatasetExplorerWorkspace = DatasetExplorerWorkspace> {
    /** The provider identifier */
    readonly id: string;
    /** The provider type identifier */
    readonly type: string;
    /** The provider name */
    readonly name: string;
    /** The provider description */
    readonly description: string | undefined;

    @observable.ref active: boolean;

    @observable.ref protected workspaces_: IObservableArray<DatasetExplorerWorkspaceEntity<T>>;

    constructor(config: DatasetExplorerWorkspaceProviderConfig) {
        this.id = config.id;
        this.type = config.type;
        this.name = config.name;
        this.description = config.description;

        this.active = config.active || false;

        this.workspaces_ = observable.array([], {
            deep: false
        });

        makeObservable(this);
    }

    get workspaces() {
        return this.workspaces_;
    }

    isSaveSupported() {
        return false;
    }

    saveWorkspace(workspace: Omit<DatasetExplorerWorkspace, 'id' | 'provider'>): Promise<string> {
        throw new Error('Workspace saving not supported by this provider');
    }

    updateWorkspace(workspace: Omit<DatasetExplorerWorkspace, 'provider'>): Promise<void> {
        throw new Error('Workspace saving not supported by this provider');
    }

    deleteWorkspace(workspaceId: number) {
        throw new Error('Workspace saving not supported by this provider');
    }

    @action
    setActive(active: boolean) {
        this.active = active;
    }
}
