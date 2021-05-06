import { computed, makeObservable, observable, action } from 'mobx';
import chroma from 'chroma-js';

import { IFeatureStyle, randomColorFactory } from '@oida/core';
import {
    MapLayer,
    HasVisibility, Visible, VisibleProps,
    IsHoverable, Hovered, HoveredProps,
    IsSelectable, Selected, SelectedProps
} from '@oida/state-mobx';

import { DatasetViz, DatasetVizProps } from './dataset-viz';
import { SharedAoi, SharedAoiProps } from './shared-aoi';


const randomColorGenerator = randomColorFactory();

export type DatasetAnalysisProps<TYPE extends string = string, CONFIG extends Record<string, any> = Record<string, any>> = {
    color?: string;
    aoi?: SharedAoi | SharedAoiProps;
} & DatasetVizProps<TYPE, CONFIG> & VisibleProps & SelectedProps & HoveredProps;

export abstract class DatasetAnalysis<T extends MapLayer | undefined>
extends DatasetViz<T>
implements HasVisibility, IsHoverable, IsSelectable {

    readonly visible: Visible;
    readonly hovered: Hovered;
    readonly selected: Selected;
    readonly defaultColor: string;
    @observable.ref aoi: SharedAoi | undefined;

    constructor(props: DatasetAnalysisProps) {
        super(props);

        this.visible = new Visible(props);
        this.selected = new Selected(props);
        this.hovered = new Hovered(props);
        this.defaultColor = props.color || randomColorGenerator();
        this.aoi = undefined;
        this.setAoi(props.aoi);

        makeObservable(this);
    }

    @computed
    get color() {
        let color = this.defaultColor;
        if (this.selected.value) {
            color = '#FFFF00';
        } else if (this.hovered.value) {
            color = chroma(color).brighten(1).hex();
        }
        return color;
    }

    @action
    setAoi(aoi: SharedAoi | SharedAoiProps | undefined) {
        if (aoi !== this.aoi) {
            if (this.aoi) {
                this.aoi.unref();
            }
            if (aoi) {
                this.aoi = aoi instanceof SharedAoi ? aoi : new SharedAoi(aoi);
                this.aoi.ref();
            } else {
                this.aoi = undefined;
            }
        }
    }

    @computed
    get geometry() {
        return this.aoi?.geometry.value;
    }

    get style(): IFeatureStyle | Record<string, IFeatureStyle> | IFeatureStyle[] | undefined {
        return undefined;
    }

    /**
     * Override in inherited class to enable specific geometry hovering behaviours
     *
     * @param coordinate The hovered geometry lat lon position
     */
    onGeometryHover(coordinate: GeoJSON.Position) {}

    dispose() {
        if (this.aoi) {
            this.aoi.unref();
        }
        super.dispose();
    }

    abstract clone(): DatasetAnalysis<T>;

    protected clone_(specProps?: Record<string, any>) {
        return super.clone_({
            ...specProps,
            aoi: this.aoi,
            parent: this.parent
        });
    }
}
