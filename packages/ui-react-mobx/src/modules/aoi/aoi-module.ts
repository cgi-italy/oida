import { observable, makeObservable, computed, action } from 'mobx';
import { AOI_FIELD_ID, setAoiFieldFactory, FormFieldState, AoiValue } from '@oidajs/core';
import { IndexedCollection, FeatureLayer, setReactionForFilterType, FeatureStyleGetter } from '@oidajs/state-mobx';

import { AppModule } from '../app-module';
import { MapComponentFromModule, MapModule } from '../map';
import { defaultAoiStyleGetter, bindAoiValueToMap } from './utils';
import { Aoi, AoiProps, AoiSource } from './models';
import { useMapAoiFieldFromModule } from './hooks/use-map-aoi-field';

export const DEFAULT_AOI_MODULE_ID = 'aoi';

/** A function that extract a list of aois from the file */
export type AoiParser = (input: string | File) => Promise<AoiProps[]>;
/** AOI format type */
export type AoiFormat = {
    /** format id */
    id: string;
    /** format name */
    name: string;
    /** list of supported file extensions */
    supportedFileTypes: string[];
    /** the file parser */
    parser: AoiParser;
};

export type AoiModuleConfig = {
    /** the supported aoi import formats */
    aoiFormats?: AoiFormat[];
};

/**
 * The {@Link AoiModule} initialization object
 */
export type AoiModuleProps = {
    mapModule: MapModule;
    /** The map feature styler */
    aoiStyleGetter?: FeatureStyleGetter<Aoi>;
    config: AoiModuleConfig;
    id?: string;
};

/**
 * An application module to handle areas of interest
 */
export class AoiModule extends AppModule {
    /** the area of interest collection */
    readonly aois: IndexedCollection<Aoi>;
    /** map module reference */
    readonly mapModule: MapModule;
    /** AOI sources collection. Usually used to allow aoi selection */
    readonly aoiSources: IndexedCollection<AoiSource>;
    /**
     * The AOI map layer. It is automatically added to the map on module initialization.
     * By default it will display the aois within the {@Link AoiModule.aois} collection.
     * If an {@Link AoiModule.activeSource active source} is defined, aois within the source will be
     * displayed instead
     *
     */
    readonly aoiLayer: FeatureLayer<Aoi>;
    readonly config: AoiModuleConfig;

    @observable.ref protected activeSourceId_: string | undefined;

    protected lastActiveSourceId_: string | undefined;

    constructor(props: AoiModuleProps) {
        super({
            id: props.id || DEFAULT_AOI_MODULE_ID
        });

        this.aois = new IndexedCollection({
            idGetter: (aoi) => aoi.id
        });
        this.aoiSources = new IndexedCollection({
            idGetter: (aoiSource) => aoiSource.id
        });

        this.aoiLayer = new FeatureLayer({
            id: 'aoiLayer',
            config: {
                geometryGetter: (aoi) => aoi.geometry.value,
                styleGetter: props.aoiStyleGetter || defaultAoiStyleGetter
            },
            source: this.aois.items,
            zIndex: 10
        });

        props.mapModule.map.layers.children.add(this.aoiLayer);

        this.mapModule = props.mapModule;
        this.config = props.config;

        this.activeSourceId_ = undefined;
        this.lastActiveSourceId_ = undefined;

        // every time an aoi filter is set, a corresponding aoi instance is drawn on the map
        setReactionForFilterType(AOI_FIELD_ID, (filters, key) => {
            const filterMapBindingDisposer = bindAoiValueToMap({
                aois: this.aois,
                getter: () => filters.get(key)?.value,
                setter: (value) => {
                    // we delay the execution to avoid that the setter is called
                    // during the reaction binding
                    setTimeout(() => {
                        filters.set(key, value, AOI_FIELD_ID);
                    }, 0);
                },
                map: this.mapModule.map,
                hidden: true
            });
            return filterMapBindingDisposer;
        });

        setAoiFieldFactory((props) => {
            return {
                type: AOI_FIELD_ID,
                name: props.name,
                title: props.title || 'Area of interest',
                rendererConfig: props.rendererConfig,
                required: props.required,
                config: (filterState: FormFieldState<AoiValue>) => {
                    const aoiFieldConfig = useMapAoiFieldFromModule(
                        {
                            ...filterState,
                            supportedGeometries: props.supportedGeometries
                        },
                        this.id
                    );

                    return {
                        supportedGeometries: props.supportedGeometries,
                        supportedActions: props.supportedActions,
                        embeddedMapComponent: props.embedMap ? MapComponentFromModule : undefined,
                        ...aoiFieldConfig,
                        name: aoiFieldConfig.name || filterState.value?.geometry.type || 'Aoi'
                    };
                }
            };
        });

        makeObservable(this);
    }

    /** The active aoi source */
    @computed
    get activeSource() {
        if (this.activeSourceId_) {
            return this.aoiSources.itemWithId(this.activeSourceId_);
        } else {
            return undefined;
        }
    }

    /**
     * Set the active AOI source. The aois within the source will be displayed on map.
     * When no active source is defined the {@Link AoiModule.aois} will be visible on map
     *
     * @param activeSource The active source id or reference
     * @memberof AoiModule
     */
    @action
    setActiveSource(activeSource: string | AoiSource | undefined) {
        let id: string | undefined;
        if (typeof activeSource === 'string') {
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
            this.lastActiveSourceId_ = id;
        } else {
            this.activeSourceId_ = undefined;
            this.aoiLayer.setSource(this.aois.items);
        }
    }

    @action
    loadLastActiveSource() {
        this.setActiveSource(this.lastActiveSourceId_);
    }
}
