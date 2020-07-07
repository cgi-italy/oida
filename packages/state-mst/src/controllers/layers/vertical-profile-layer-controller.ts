import { reaction, IReactionDisposer } from 'mobx';

import { VERTICAL_PROFILE_LAYER_ID, IVerticalProfileLayerRenderer, IMapRenderer, IVerticalProfileStyle } from '@oida/core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { ArrayTracker } from '../../utils';

import { IVerticalProfileLayer } from '../../types/layers/vertical-profile-layer';
import { createEntityReference, resolveEntityReference } from '../../types/entity/entity-reference';
import { entityReferenceFromFeatureId } from '../layers/feature-layer-controller';

type ProfileTracker = {
    id: string,
    disposeProfileObserver: IReactionDisposer,
    disposeStyleObserver: IReactionDisposer
};

export class VerticalProfileLayerController extends MapLayerController<IVerticalProfileLayerRenderer, IVerticalProfileLayer> {

    private sourceTracker_: ArrayTracker<ProfileTracker> | undefined;

    protected createLayerRenderer_(mapRenderer: IMapRenderer) {

        const onCoordinateSelect = (coordinate, featureId) => {

            let evtProfile = resolveEntityReference(entityReferenceFromFeatureId(featureId), this.mapLayer_.source.items);
            let selectedProfile = this.mapLayer_.source.items.find(item => item.selected);
            if (selectedProfile && selectedProfile === evtProfile) {
                this.mapLayer_.setSelectedCoordinate({
                    profileId: selectedProfile.id,
                    geographic: coordinate
                });
            } else {
                this.mapLayer_.setSelectedCoordinate(undefined);
            }
        };

        const onCoordinateHover = (coordinate, featureId) => {

            let evtProfile = resolveEntityReference(entityReferenceFromFeatureId(featureId), this.mapLayer_.source.items);
            let selectedProfile = this.mapLayer_.source.items.find(item => item.selected);
            if (selectedProfile && selectedProfile === evtProfile) {
                this.mapLayer_.setHighlihgtedCoordinate({
                    profileId: selectedProfile.id,
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
            reaction(() => {
                let source;
                //source could be an invalid reference
                try {
                    source = this.mapLayer_.source;
                } catch (e) {
                    source = null;
                }
                return source;
            }, (source) => {
                this.onSourceChange_(source);
            }, {fireImmediately: true})
        );

        this.subscriptionTracker_.addSubscription(
            reaction(() => this.mapLayer_.highlightedCoordinate, (coord) => {
                if (coord) {
                    let profile = this.mapLayer_.source.itemWithId(coord.profileId);
                    if (profile) {
                        coord = {
                            ...coord,
                            profileId: createEntityReference(profile)
                        };
                    } else {
                        coord = undefined;
                    }
                }
                layerRenderer.setHighlightedCoordinate(coord);
            })
        );

        this.subscriptionTracker_.addSubscription(
            reaction(() => this.mapLayer_.selectedCoordinate, (coord) => {
                if (coord) {
                    let profile = this.mapLayer_.source.itemWithId(coord.profileId);
                    if (profile) {
                        coord = {
                            ...coord,
                            profileId: createEntityReference(profile)
                        };
                    } else {
                        coord = undefined;
                    }
                }
                layerRenderer.setSelectedCoordinate(coord);
            })
        );

        this.subscriptionTracker_.addSubscription(
            reaction(() => this.mapLayer_.highlightedRegion, (bbox) => {
                layerRenderer.setHighlightedRegion(bbox);
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

    protected onSourceChange_(source) {

        if (this.sourceTracker_) {
            this.sourceTracker_.destroy();
            delete this.sourceTracker_;
        }
        if (source) {
            this.sourceTracker_ = new ArrayTracker({
                items: source.items,
                onItemAdd: this.addProfile_.bind(this),
                onItemRemove: this.removeProfile_.bind(this)
            });
        }
    }

    protected addProfile_(entity) {

        let profileId = createEntityReference(entity);

        let profile = this.mapLayer_.config.profileGetter(entity);
        let style = this.mapLayer_.config.styleGetter(entity);

        const layerRenderer = this.layerRenderer_!;

        layerRenderer.addProfile(profileId, profile, style);

        let disposeProfileObserver = reaction(() => this.mapLayer_.config.profileGetter(entity), (profile) => {
            if (layerRenderer.getProfile(profileId)) {
                if (profile) {
                    layerRenderer.updateProfile(profileId, profile);
                } else {
                    layerRenderer.removeProfile(profileId);
                }
            } else {
                if (profile) {
                    layerRenderer.addProfile(profileId, profile, this.mapLayer_.config.styleGetter(entity));
                }
            }
        });

        let disposeStyleObserver = reaction(() => this.mapLayer_.config.styleGetter(entity), (style) => {
            if (layerRenderer.getProfile(profileId)) {
                layerRenderer.updateProfileStyle(profileId, style);
            }
        });

        return {
            id: profileId,
            disposeProfileObserver,
            disposeStyleObserver
        };
    }

    protected removeProfile_(profileTracker) {
        profileTracker.disposeProfileObserver();
        profileTracker.disposeStyleObserver();
        this.layerRenderer_!.removeProfile(profileTracker.id);
    }

}

layerControllersFactory.register(VERTICAL_PROFILE_LAYER_ID, (config) => {
    return new VerticalProfileLayerController(config);
});
