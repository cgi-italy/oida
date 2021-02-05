import { v4 as uuid } from 'uuid';

import { createDynamicFactory } from '@oida/core';
import { MapLayer } from '@oida/state-mobx';

import { Dataset } from './dataset';
import { observable, makeObservable, action } from 'mobx';


const datasetVizFactory = createDynamicFactory<DatasetViz<MapLayer | undefined>>('datasetVizFactory');

export type DatasetVizProps = {
    dataset: Dataset;
    vizType: string;
    id?: string;
    parent?: DatasetViz<any>
};

export abstract class DatasetViz<T extends (MapLayer | undefined) = undefined> {

    static create(props: DatasetVizProps & Record<string, any>) {
        const { vizType, ...config } = props;
        const datasetViz = datasetVizFactory.create(vizType, config);
        if (!datasetViz) {
            throw new Error(`DatasetViz.create: Unable to create dataset viz of type ${vizType}`);
        }
        return datasetViz;
    }

    static register<P extends Omit<DatasetVizProps, 'vizType'>, T extends DatasetViz<any>>(
        vizType: string, layerCtor: new(props: P) => T
    ) {
        datasetVizFactory.register(vizType, (props: P) => {
            return new layerCtor(props);
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

    dispose() {}

    protected clone_(specProps?: Record<string, any>) {
        return new (this.constructor as any)({
            parent: this.parent,
            vizType: this.vizType,
            dataset: this.dataset,
            ...specProps
        });
    }

    protected abstract initMapLayer_(props: DatasetVizProps) : T;
}
