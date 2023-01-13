import { v4 as uuid } from 'uuid';
import { observable, makeObservable, action } from 'mobx';

import { createDynamicFactory } from '@oidajs/core';
import { MapLayer } from '@oidajs/state-mobx';

import { Dataset } from './dataset';
import { DatasetDimensions, DatasetDimensionsProps, HasDatasetDimensions } from './dataset-dimensions';

const datasetVizFactory = createDynamicFactory<DatasetViz<string, MapLayer | undefined>>('datasetVizFactory');

export type DatasetVizProps<TYPE extends string = string, CONFIG extends Record<string, any> = Record<string, any>> = {
    dataset: Dataset;
    vizType: TYPE;
    config: CONFIG;
    id?: string;
    name?: string;
    parent?: DatasetViz<string, any>;
    mapLayer?: {
        opacity: number;
        visible: boolean;
    };
} & DatasetDimensionsProps;

export interface DatasetVizDefinitions extends Record<string, DatasetVizProps> {}
export interface DatasetVizTypes extends Record<string, DatasetViz<string, MapLayer | undefined>> {}

export type DatasetVizDefinition<TYPE extends string = Extract<keyof DatasetVizDefinitions, string>> = {
    vizType: TYPE;
} & TYPE extends keyof DatasetVizDefinitions
    ? DatasetVizDefinitions[TYPE]
    : DatasetVizProps<TYPE>;

export type DatasetVizType<TYPE extends string = Extract<keyof DatasetVizTypes, string>> = TYPE extends keyof DatasetVizTypes
    ? DatasetVizTypes[TYPE]
    : DatasetViz<TYPE, MapLayer | undefined>;

export type DatasetVizConfig<TYPE extends string = Extract<keyof DatasetVizDefinitions, string>> = TYPE extends keyof DatasetVizDefinitions
    ? DatasetVizDefinition<TYPE>['config']
    : Record<string, any>;

export type SerializableType = string | number | boolean | null | undefined | Array<SerializableType> | { [x: string]: SerializableType };

export type DatasetVizSnapshot<TYPE extends string = string> = {
    id: string;
    datasetId: string;
    name: string;
    vizType: TYPE;
    parentId?: string;
    mapLayer?: {
        opacity: number;
        visible: boolean;
    };
};

/**
 * Base abstract class for {@link Dataset} visualization. A dataset visualization can include a {@link MapLayer}
 * and a control widget
 *
 * @template T the type of MapLayer associated to this visualization
 */
export abstract class DatasetViz<T extends string, M extends MapLayer | undefined = undefined> implements HasDatasetDimensions {
    protected static instances_: Map<string, WeakRef<DatasetViz<string, any>>> = new Map();

    static create<TYPE extends string>(props: DatasetVizDefinition<TYPE>): DatasetVizType<TYPE> {
        const datasetViz = datasetVizFactory.create(props.vizType, props);
        if (!datasetViz) {
            throw new Error(`DatasetViz.create: Unable to create dataset viz of type ${props.vizType}`);
        }
        return datasetViz as DatasetVizType<TYPE>;
    }

    static register<TYPE extends string, V extends DatasetViz<string, MapLayer | undefined>>(
        vizType: TYPE,
        vizCtor: new (props: Omit<DatasetVizDefinition<TYPE>, 'vizType'>) => V
    ) {
        datasetVizFactory.register(vizType, (props) => {
            return new vizCtor(props);
        });
    }

    static getInstance(id: string) {
        return DatasetViz.instances_.get(id)?.deref();
    }

    static createFromSnapshot<TYPE extends string>(snapshot: DatasetVizSnapshot<TYPE>) {
        const { datasetId, parentId, ...vizProps } = snapshot;
        const dataset = Dataset.getInstance(datasetId);
        if (!dataset) {
            throw new Error(`No dataset instancewith id ${datasetId} available`);
        }
        const isMapViz = dataset.config.mapView?.type === snapshot.vizType;
        if (isMapViz) {
            return DatasetViz.create({
                ...vizProps,
                config: dataset.config.mapView!.config,
                dataset: dataset,
                parent: parentId ? DatasetViz.getInstance(parentId) : undefined
            }) as DatasetVizType<TYPE>;
        } else {
            const processingTool = dataset.config.tools?.find((tool) => {
                return tool.type === snapshot.vizType;
            });
            if (!processingTool) {
                throw new Error(`No visualization of type ${snapshot.vizType} available for dataset ${datasetId}`);
            }
            return DatasetViz.create({
                ...vizProps,
                config: processingTool.config,
                dataset: dataset,
                parent: parentId ? DatasetViz.getInstance(parentId) : undefined
            }) as DatasetVizType<TYPE>;
        }
    }

    readonly id: string;
    readonly vizType: T;
    readonly dataset: Dataset;
    readonly parent: DatasetViz<string, any> | undefined;
    readonly mapLayer: M;
    readonly dimensions: DatasetDimensions;
    @observable widgetVisible: boolean;
    @observable name: string;

    constructor(props: DatasetVizProps<T>) {
        this.id = props.id || uuid();
        this.parent = props.parent;
        this.vizType = props.vizType;
        this.dataset = props.dataset;
        this.mapLayer = this.initMapLayer_(props);
        if (this.mapLayer && props.mapLayer) {
            this.mapLayer?.visible.setValue(props.mapLayer.visible);
            this.mapLayer?.opacity.setValue(props.mapLayer.opacity);
        }
        this.dimensions = new DatasetDimensions(props);
        this.name = props.name || props.dataset.config.name;
        this.widgetVisible = true;

        DatasetViz.instances_.set(this.id, new WeakRef(this));

        makeObservable(this);
    }

    @action
    setWidgetVisible(widgetVisible: boolean) {
        this.widgetVisible = widgetVisible;
    }

    @action
    setName(name: string) {
        this.name = name;
    }

    get widgetName() {
        return this.name;
    }

    getSnapshot(): DatasetVizSnapshot<T> {
        return {
            id: this.id,
            datasetId: this.dataset.id,
            name: this.name,
            vizType: this.vizType,
            parentId: this.parent?.id,
            mapLayer:
                this.mapLayer !== undefined
                    ? {
                          opacity: this.mapLayer.opacity.value,
                          visible: this.mapLayer.visible.value
                      }
                    : undefined,
            ...this.dimensions.getSnapshot()
        };
    }

    dispose() {
        this.dimensions.dispose();
        DatasetViz.instances_.delete(this.id);
    }

    protected clone_(specProps?: Record<string, any>): this {
        return new (this.constructor as any)({
            parent: this.parent,
            vizType: this.vizType,
            dataset: this.dataset,
            dimensionValues: this.dimensions.values,
            ...specProps
        });
    }

    protected abstract initMapLayer_(props: DatasetVizProps<T>): M;
}
