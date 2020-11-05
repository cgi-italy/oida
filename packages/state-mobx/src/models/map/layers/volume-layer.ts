import { observable, makeObservable, action } from 'mobx';

import { VOLUME_LAYER_ID, VolumeSourceConfig, SLICE_VOLUME_VIEW_ID, STACK_VOLUME_VIEW_ID } from '@oida/core';

import { MapLayer, MapLayerProps } from './map-layer';

export type VolumeColorMapRange = {
    min: number;
    max: number;
};

export type VolumeColorMapProps = {
    colorScale: HTMLCanvasElement | HTMLImageElement;
    mapRange: VolumeColorMapRange;
    clamp?: boolean;
    noDataValue?: number;
};

export class VolumeColorMap {
    @observable.ref colorScale: HTMLCanvasElement | HTMLImageElement;
    @observable.ref mapRange: VolumeColorMapRange;
    @observable clamp: boolean;
    @observable noDataValue: number | undefined;

    constructor(props: VolumeColorMapProps) {
        this.colorScale = props.colorScale;
        this.mapRange = props.mapRange;
        this.clamp = props.clamp !== undefined ? props.clamp : true;
        this.noDataValue = props.noDataValue;

        makeObservable(this);
    }

    @action
    setColorScale(colorScale: HTMLCanvasElement | HTMLImageElement) {
        this.colorScale = colorScale;
    }

    @action
    setRange(range: VolumeColorMapRange) {
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

}

export type StackVolumeViewModeProps = {
    numSlices: number;
};

export class StackVolumeViewMode {
    readonly mode: typeof STACK_VOLUME_VIEW_ID;
    @observable numSlices: number;

    constructor(props: StackVolumeViewModeProps) {
        this.mode = STACK_VOLUME_VIEW_ID;
        this.numSlices = props.numSlices;

        makeObservable(this);
    }

    @action
    setNumSlices(numSlices: number) {
        this.numSlices = numSlices;
    }
}

export type SliceVolumeViewModeProps = {
    xSlice?: number;
    ySlice?: number;
    zSlice?: number;
};

export class SliceVolumeViewMode {
    readonly mode: typeof SLICE_VOLUME_VIEW_ID;
    @observable xSlice: number | undefined;
    @observable ySlice: number | undefined;
    @observable zSlice: number | undefined;

    constructor(props: SliceVolumeViewModeProps) {
        this.mode = SLICE_VOLUME_VIEW_ID;
        this.xSlice = props.xSlice;
        this.ySlice = props.ySlice;
        this.zSlice = props.zSlice;

        makeObservable(this);
    }

    @action
    setXSlice(xSlice: number | undefined) {
        this.xSlice = xSlice;
    }

    @action
    setYSlice(ySlice: number | undefined) {
        this.ySlice = ySlice;
    }

    @action
    setZSlice(zSlice: number | undefined) {
        this.zSlice = zSlice;
    }
}

export type VolumeViewMode = StackVolumeViewMode | SliceVolumeViewMode;

export type VolumeLayerProps = {
    source?: VolumeSourceConfig;
    verticalScale?: number;
    colorMap?: VolumeColorMap | VolumeColorMapProps;
    viewMode: VolumeViewMode
} & Omit<MapLayerProps, 'layerType'>;

export class VolumeLayer extends MapLayer {
    @observable.ref source: VolumeSourceConfig | undefined;
    @observable sourceRevision: number;
    @observable verticalScale: number;
    @observable.ref colorMap: VolumeColorMap | undefined;
    @observable.ref viewMode: VolumeViewMode;

    constructor(props: VolumeLayerProps) {
        super({
            ...props,
            layerType: VOLUME_LAYER_ID
        });

        this.source = props.source;
        this.sourceRevision = 0;
        this.verticalScale = props.verticalScale || 1;
        this.setColorMap(props.colorMap);
        this.viewMode = props.viewMode;

        makeObservable(this);
    }

    @action
    setSource(source: VolumeSourceConfig | undefined) {
        this.source = source;
        this.sourceRevision = 0;
    }

    @action
    setColorMap(colorMap: VolumeColorMap | VolumeColorMapProps | undefined) {
        if (colorMap) {
            this.colorMap = colorMap instanceof VolumeColorMap ? colorMap : new VolumeColorMap(colorMap);
        } else {
            this.colorMap = undefined;
        }
    }

    @action
    setVerticalScale(verticalScale: number) {
        this.verticalScale = verticalScale;
    }

    @action
    setViewMode(viewMode: VolumeViewMode) {
        this.viewMode = viewMode;
    }

    @action
    forceRefresh() {
        this.sourceRevision++;
    }

}
