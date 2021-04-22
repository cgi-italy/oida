import { MapCoord } from '@oida/core';
import { makeAutoObservable, observable } from 'mobx';

export type MapViewportProps = {
    center: MapCoord;
    resolution: number;
    rotation?: number;
    pitch?: number;
};

export class MapViewport {
    center: MapCoord;
    resolution: number;
    rotation: number;
    pitch: number;

    constructor(props: MapViewportProps) {
        this.center = props.center;
        this.resolution = props.resolution;
        this.rotation = props.rotation || 0;
        this.pitch = props.pitch || 0;

        makeAutoObservable(this, {
            center: observable.ref
        });

    }

    setCenter(center: MapCoord) {
        this.center = center;
    }

    setResolution(resolution: number) {
        this.resolution = resolution;
    }

    setRotation(rotation: number) {
        this.rotation = rotation;
    }

    setPitch(pitch: number) {
        this.pitch = pitch;
    }
}
