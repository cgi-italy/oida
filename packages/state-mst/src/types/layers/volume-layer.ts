import { types, Instance } from 'mobx-state-tree';

import { VOLUME_LAYER_ID, VolumeSourceConfig, SLICE_VOLUME_VIEW_ID, STACK_VOLUME_VIEW_ID } from '@oida/core';

import { NonSerializableType } from '../mst';
import { MapLayer } from './map-layer';

const VolumeColorMapDecl = types.model('VolumeColorMap', {
    image: NonSerializableType<HTMLCanvasElement | HTMLImageElement>(),
    range: types.model({
        min: types.number,
        max: types.number
    }),
    clamp: types.boolean,
    noData: types.number
}).actions((self) => {
    return {
        setRange(min: number, max: number) {
            self.range = {
                min: min,
                max: max
            };
        },
        setImage(image: HTMLCanvasElement | HTMLImageElement) {
            self.image = image;
        },
        setClamp(clamp: boolean) {
            self.clamp = clamp;
        },
        setNoData(noData: number) {
            self.noData = noData;
        }
    };
});

type VolumeColorMapType = typeof VolumeColorMapDecl;
export interface VolumeColorMapInterface extends VolumeColorMapType {}
export const VolumeColorMap: VolumeColorMapInterface = VolumeColorMapDecl;
export interface IVolumeColorMap extends Instance<VolumeColorMapInterface> {}


const VolumeViewModeDecl = types.model({
    mode: types.string
});

type VolumeViewModeType = typeof VolumeViewModeDecl;
export interface VolumeViewModeInterface extends VolumeViewModeType {}
export const VolumeViewMode: VolumeViewModeInterface = VolumeViewModeDecl;
export interface IVolumeViewMode extends Instance<VolumeViewModeInterface> {}

const StackVolumeModeDecl = VolumeViewMode.props({
    mode: types.literal(STACK_VOLUME_VIEW_ID),
    numSlices: types.optional(types.number, 16)
}).actions((self) => {
    return {
        setNumSlices: (numSlices: number) => {
            self.numSlices = numSlices;
        }
    };
});

type StackVolumeModeType = typeof StackVolumeModeDecl;
export interface StackVolumeModeInterface extends StackVolumeModeType {}
export const StackVolumeMode: StackVolumeModeInterface = StackVolumeModeDecl;
export interface IStackVolumeMode extends Instance<StackVolumeModeInterface> {}

const VolumeSlicePlane = types.refinement(types.number, value => value >= 0 && value <= 1);

const SliceVolumeModeDecl = VolumeViewMode.props({
    mode: types.literal(SLICE_VOLUME_VIEW_ID),
    xSlice: types.maybe(VolumeSlicePlane),
    ySlice: types.maybe(VolumeSlicePlane),
    zSlice: types.maybe(VolumeSlicePlane)
}).actions((self) => {
    return {
        setXSlice: (xSlice: number | undefined) => {
            self.xSlice = xSlice;
        },
        setYSlice: (ySlice: number | undefined) => {
            self.ySlice = ySlice;
        },
        setZSlice: (zSlice: number | undefined) => {
            self.zSlice = zSlice;
        }
    };
});

type SliceVolumeModeType = typeof SliceVolumeModeDecl;
export interface SliceVolumeModeInterface extends SliceVolumeModeType {}
export const SliceVolumeMode: SliceVolumeModeInterface = SliceVolumeModeDecl;
export interface ISliceVolumeMode extends Instance<SliceVolumeModeInterface> {}

const VolumeModeDecl = types.union(StackVolumeMode, SliceVolumeMode);
type VolumeModeType = typeof VolumeModeDecl;
export interface VolumeModeInterface extends VolumeModeType {}
export const VolumeMode: VolumeModeInterface = VolumeModeDecl;


const VolumeLayerDecl = MapLayer.addModel(
    types.model(VOLUME_LAYER_ID, {
        source: types.maybe(NonSerializableType<VolumeSourceConfig>()),
        sourceRevision: types.optional(types.number, 0),
        colorMap: types.maybe(VolumeColorMap),
        viewMode: VolumeMode,
        verticalScale: types.optional(types.number, 1)
    }).actions((self) => {
        return {
            setSource: (source?: VolumeSourceConfig) => {
                self.source = source;
                self.sourceRevision = 0;
            },
            setViewMode: (viewMode) => {
                self.viewMode = viewMode;
            },
            setVerticalScale: (verticalScale) => {
                self.verticalScale = verticalScale;
            },
            forceRefresh: () => {
                self.sourceRevision++;
            }
        };
    })
);

type VolumeLayerType = typeof VolumeLayerDecl;
export interface VolumeLayerInterface extends VolumeLayerType {}
export const VolumeLayer: VolumeLayerInterface = VolumeLayerDecl;
export interface IVolumeLayer extends Instance<VolumeLayerInterface> {}

