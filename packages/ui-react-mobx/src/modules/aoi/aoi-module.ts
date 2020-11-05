import { observable, makeObservable, computed, action } from 'mobx';
import { IndexedCollection, FeatureLayer } from '@oida/state-mobx';

import { AppModule } from '../app-module';
import { MapModule } from '../map';
import { defaultAoiStyleGetter } from './utils';
import { Aoi, AoiProps, AoiSource } from './models';


export const DEFAULT_AOI_MODULE_ID = 'aoi';

export type AoiParser = (input: string | File) => Promise<AoiProps[]>;
export type AoiFormat = {
    id: string;
    name: string;
    supportedFileTypes: string[];
    parser: AoiParser
};

export type AoiModuleConfig = {
    aoiFormats?: AoiFormat[]
};


export type AoiModuleProps = {
    mapModule: MapModule;
    config: AoiModuleConfig;
    id?: string
};

export class AoiModule extends AppModule {

    readonly aois: IndexedCollection<Aoi>;
    readonly mapModule: MapModule;
    readonly aoiSources: IndexedCollection<AoiSource>;
    readonly aoiLayer: FeatureLayer<Aoi>;
    readonly config: AoiModuleConfig;

    @observable.ref protected activeSourceId_: string | undefined;

    constructor(props: AoiModuleProps) {
        super({
            id: props.id || DEFAULT_AOI_MODULE_ID
        });

        this.aois = new IndexedCollection({
            idGetter: (aoi) => aoi.id
        });
        this.aoiSources = new IndexedCollection({
            idGetter: aoiSource => aoiSource.id
        });

        this.aoiLayer = new FeatureLayer({
            id: 'aoiLayer',
            config: {
                geometryGetter: (aoi) => aoi.geometry.value,
                styleGetter: defaultAoiStyleGetter
            },
            source: this.aois.items
        });

        props.mapModule.map.layers.children.add(this.aoiLayer);

        this.mapModule = props.mapModule;
        this.config = props.config;

        makeObservable(this);
    }

    @computed
    get activeSource() {
        if (this.activeSourceId_) {
            return this.aoiSources.itemWithId(this.activeSourceId_);
        } else {
            return undefined;
        }
    }

    @action
    setActiveSource(activeSource: string | AoiSource | undefined) {
        let id: string | undefined;
        if (typeof(activeSource) === 'string') {
            id = activeSource;
        } else if (activeSource instanceof AoiSource) {
            id = activeSource.id;
        }
        if (id) {
            const source = this.aoiSources.itemWithId(id);
            if (!source) {
                this.activeSourceId_ = undefined;
                this.aoiLayer.setSource(this.aois.items);
                throw new Error(`AoiModule:setActiveSource: no source found with id ${id}`);
            }
            this.activeSourceId_ = id;
            this.aoiLayer.setSource(source.aois.items);
        } else {
            this.activeSourceId_ = undefined;
            this.aoiLayer.setSource(this.aois.items);
        }
    }
}
