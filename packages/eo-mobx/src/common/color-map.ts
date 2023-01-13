import { observable, makeObservable, action } from 'mobx';

import { DomainRange } from '../common';

export enum ColorScaleType {
    Fixed = 'fixed',
    Parametric = 'parametric'
}

export type ColorScale = {
    id: string;
    name: string;
    type: ColorScaleType;
    legend: HTMLImageElement | HTMLCanvasElement;
    colors?: string[];
    positions?: number[];
};

export type ColorMapDomainProps = {
    mapRange: DomainRange<number>;
    clamp?: boolean;
    noDataValue?: number;
};

export class ColorMapDomain {
    @observable.ref mapRange: DomainRange<number>;
    @observable.ref clamp: boolean;
    @observable.ref noDataValue: number | undefined;

    constructor(props: ColorMapDomainProps) {
        this.mapRange = props.mapRange;
        this.clamp = props.clamp !== undefined ? props.clamp : true;
        this.noDataValue = props.noDataValue;

        makeObservable(this);
    }

    @action
    setRange(range: DomainRange<number>) {
        this.mapRange = range;
    }

    @action
    setClamp(clamp: boolean) {
        this.clamp = clamp;
    }

    @action
    setNoDataValue(noDataValue: number | undefined) {
        this.noDataValue = noDataValue;
    }

    getSnapshot(): ColorMapDomainProps {
        return {
            mapRange: this.mapRange,
            clamp: this.clamp,
            noDataValue: this.noDataValue
        };
    }

    @action
    applySnapshot(snapshot: ColorMapDomainProps) {
        this.mapRange = snapshot.mapRange;
        this.clamp = snapshot.clamp !== undefined ? snapshot.clamp : true;
        this.noDataValue = snapshot.noDataValue;
    }
}

export type ColorMapProps = {
    colorScale: string;
    domain?: ColorMapDomain | ColorMapDomainProps;
};

export type ColorMapSnapshot = {
    colorScale: string;
    domain?: ColorMapDomainProps;
};
export class ColorMap {
    @observable.ref colorScale: string;
    @observable.ref domain: ColorMapDomain | undefined;

    constructor(props: ColorMapProps) {
        this.colorScale = props.colorScale;
        if (props.domain) {
            this.domain = props.domain instanceof ColorMapDomain ? props.domain : new ColorMapDomain(props.domain);
        } else {
            this.domain = undefined;
        }

        makeObservable(this);
    }

    @action
    setColorScale(colorScale: string) {
        this.colorScale = colorScale;
    }

    @action
    setColorMapDomain(domain: ColorMapDomain | ColorMapDomainProps | undefined) {
        if (domain) {
            this.domain = domain instanceof ColorMapDomain ? domain : new ColorMapDomain(domain);
        } else {
            this.domain = undefined;
        }
    }

    getSnapshot(): ColorMapSnapshot {
        return {
            colorScale: this.colorScale,
            domain: this.domain?.getSnapshot()
        };
    }

    @action
    applySnapshot(snapshot: ColorMapSnapshot) {
        this.colorScale = snapshot.colorScale;
        this.domain = snapshot.domain ? new ColorMapDomain(snapshot.domain) : undefined;
    }
}
