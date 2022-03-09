import { v4 as uuid } from 'uuid';
import { observable, makeObservable, action } from 'mobx';

import { createDynamicFactory } from '@oidajs/core';
import { MapLayer } from '@oidajs/state-mobx';

import { Dataset } from './dataset';

const datasetVizFactory = createDynamicFactory<DatasetViz<MapLayer | undefined>>('datasetVizFactory');

export type DatasetVizProps<TYPE extends string = string, CONFIG extends Record<string, any> = Record<string, any>> = {
    dataset: Dataset;
    vizType: TYPE;
    config: CONFIG;
    id?: string;
    parent?: DatasetViz<any>;
};

export interface DatasetVizDefinitions {}
export interface DatasetVizTypes {}

export type DatasetVizDefinition<TYPE extends keyof DatasetVizDefinitions = keyof DatasetVizDefinitions> = { vizType: TYPE } & Extract<
    DatasetVizDefinitions[TYPE],
    DatasetVizProps<TYPE>
>;

export type DatasetVizType<TYPE extends keyof DatasetVizTypes = keyof DatasetVizTypes> = Extract<
    DatasetVizTypes[TYPE],
    DatasetViz<MapLayer | undefined>
>;

export type DatasetVizConfig<TYPE extends keyof DatasetVizDefinitions = keyof DatasetVizDefinitions> = DatasetVizDefinition<TYPE>['config'];

/**
 * Base abstract class for {@link Dataset} visualization. A dataset visualization can include a {@link MapLayer}
 * and a control widget
 *
 * @template T the type of MapLayer associated to this visualization
 */
export abstract class DatasetViz<T extends MapLayer | undefined = undefined> {
    static create<TYPE extends keyof DatasetVizTypes>(props: DatasetVizDefinition<TYPE>): DatasetVizType<TYPE> {
        const datasetViz = datasetVizFactory.create(props.vizType, props);
        if (!datasetViz) {
            throw new Error(`DatasetViz.create: Unable to create dataset viz of type ${props.vizType}`);
        }
        return datasetViz as DatasetVizType<TYPE>;
    }

    static register<TYPE extends keyof DatasetVizDefinitions, V extends DatasetViz<MapLayer | undefined>>(
        vizType: TYPE,
        vizCtor: new (props: Omit<DatasetVizDefinition<TYPE>, 'vizType'>) => V
    ) {
        datasetVizFactory.register(vizType, (props) => {
            return new vizCtor(props);
        });
    }

    readonly id: string;
    readonly vizType: string;
    readonly dataset: Dataset;
    readonly parent: DatasetViz<any> | undefined;
    readonly mapLayer: T;
    @observable widgetVisible: boolean;

    constructor(props: DatasetVizProps) {
        this.id = props.id || uuid();
        this.parent = props.parent;
        this.vizType = props.vizType;
        this.dataset = props.dataset;
        this.mapLayer = this.initMapLayer_(props);
        this.widgetVisible = true;

        makeObservable(this);
    }

    @action
    setWidgetVisible(widgetVisible: boolean) {
        this.widgetVisible = widgetVisible;
    }

    dispose() {
        return;
    }

    protected clone_(specProps?: Record<string, any>) {
        return new (this.constructor as any)({
            parent: this.parent,
            vizType: this.vizType,
            dataset: this.dataset,
            ...specProps
        });
    }

    protected abstract initMapLayer_(props: DatasetVizProps): T;
}
