import { observable } from 'mobx';

export type AppModuleProps = {
    id: string;
};

export class AppModule {
    readonly id: string;

    constructor(props: AppModuleProps) {
        this.id = props.id;
    }
}

export class AppModules {
    @observable.shallow
    items: Map<string, AppModule> = new Map();

    addModule(module: AppModule) {
        if (this.items.has(module.id)) {
            throw new Error(`AppModules: Cannot add module with id ${module.id}. The id is already registered`);
        }
        this.items.set(module.id, module);
    }

    getModule<T extends AppModule>(id: string) {
        const module = this.items.get(id);
        if (module) {
            return module as T;
        }
    }
}

export interface HasAppModules {
    modules: AppModules;
}
