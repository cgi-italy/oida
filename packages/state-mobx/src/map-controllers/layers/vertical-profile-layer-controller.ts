import { reaction, IReactionDisposer, IObservableArray } from 'mobx';

import { VERTICAL_PROFILE_LAYER_ID, IVerticalProfileLayerRenderer, IMapRenderer } from '@oida/core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { ArrayTracker } from '../../utils';

import { VerticalProfileLayer } from '../../models/map/layers/vertical-profile-layer';
import { FeatureInterface } from '../../models/map/layers/feature-layer';

type ProfileTracker = {
    id: string,
    disposeProfileObserver: IReactionDisposer,
    disposeStyleObserver: IReactionDisposer
};

export class VerticalProfileLayerController<T extends FeatureInterface>
extends MapLayerController<IVerticalProfileLayerRenderer, VerticalProfileLayer<T>> {

    private sourceTracker_: ArrayTracker<T, ProfileTracker> | undefined;

    protected createLayerRenderer_(mapRenderer: IMapRenderer) {

        const onCoordinateSelect = (coordinate, profileId) => {

            const profile = this.mapLayer_.source?.find(profile => profile.selected.value && profile.id === profileId);
            if (profile) {
                this.mapLayer_.setSelectedCoordinate({
                    profileId: profile.id,
                    geographic: coordinate
                });
            } else {
                this.mapLayer_.setSelectedCoordinate(undefined);
            }
        };

        const onCoordinateHover = (coordinate, profileId) => {

            const profile = this.mapLayer_.source?.find(profile => profile.selected.value && profile.id === profileId);
            if (profile) {
                this.mapLayer_.setHighlihgtedCoordinate({
                    profileId: profile.id,
                    geographic: coordinate
                });
            } else {
                this.mapLayer_.setHighlihgtedCoordinate(undefined);
            }
        };

        return <IVerticalProfileLayerRenderer>mapRenderer.getLayersFactory().create(VERTICAL_PROFILE_LAYER_ID, {
            mapRenderer: mapRenderer,
            onCoordinateSelect: onCoordinateSelect,
            onCoordinateHover: onCoordinateHover,
            ...this.mapLayer_.config
        });
    }

    protected bindToLayerState_() {
        super.bindToLayerState_();

        const layerRenderer = this.layerRenderer_!;

        this.subscriptionTracker_.addSubscription(
            reaction(() => this.mapLayer_.source, (source) => {
                this.onSourceChange_(source);
            }, {fireImmediately: true})
        );

        this.subscriptionTracker_.addSubscription(
            reaction(() => this.mapLayer_.highlightedCoordinate, (coord) => {
                layerRenderer.setHighlightedCoordinate(coord);
            })
        );

        this.subscriptionTracker_.addSubscription(
            reaction(() => this.mapLayer_.selectedCoordinate, (coord) => {
                layerRenderer.setSelectedCoordinate(coord);
            })
        );

        this.subscriptionTracker_.addSubscription(
            reaction(() => this.mapLayer_.highlightedRegion, (bbox) => {
                layerRenderer.setHighlightedRegion(bbox as GeoJSON.BBox);
            })
        );

    }

    protected unbindFromLayerState_() {
        super.unbindFromLayerState_();
        if (this.sourceTracker_) {
            this.sourceTracker_.destroy();
            delete this.sourceTracker_;
        }
    }

    protected onSourceChange_(source: IObservableArray<T> | undefined) {

        if (this.sourceTracker_) {
            this.sourceTracker_.destroy();
            delete this.sourceTracker_;
        }
        if (source) {
            this.sourceTracker_ = new ArrayTracker({
                items: source,
                onItemAdd: this.addProfile_.bind(this),
                onItemRemove: this.removeProfile_.bind(this)
            });
        }
    }

    protected addProfile_(item: T) {

        let profile = this.mapLayer_.config.value.profileGetter(item);
        let style = this.mapLayer_.config.value.styleGetter(item);

        const layerRenderer = this.layerRenderer_!;

        layerRenderer.addProfile(item.id, profile, style, {
            model: item
        });

        let disposeProfileObserver = reaction(() => this.mapLayer_.config.value.profileGetter(item), (profile) => {
            if (layerRenderer.getProfile(item.id)) {
                if (profile) {
                    layerRenderer.updateProfile(item.id, profile);
                } else {
                    layerRenderer.removeProfile(item.id);
                }
            } else {
                if (profile) {
                    layerRenderer.addProfile(item.id, profile, this.mapLayer_.config.value.styleGetter(item), {
                        model: item
                    });
                }
            }
        });

        let disposeStyleObserver = reaction(() => this.mapLayer_.config.value.styleGetter(item), (style) => {
            if (layerRenderer.getProfile(item.id)) {
                layerRenderer.updateProfileStyle(item.id, style);
            }
        });

        return {
            id: item.id,
            disposeProfileObserver,
            disposeStyleObserver
        };
    }

    protected removeProfile_(profileTracker: ProfileTracker) {
        profileTracker.disposeProfileObserver();
        profileTracker.disposeStyleObserver();
        this.layerRenderer_!.removeProfile(profileTracker.id);
    }

}

layerControllersFactory.register(VERTICAL_PROFILE_LAYER_ID, (config) => {
    return new VerticalProfileLayerController(config);
});
