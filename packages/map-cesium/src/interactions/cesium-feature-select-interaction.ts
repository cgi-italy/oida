import { ScreenSpaceEventHandler, ScreenSpaceEventType, KeyboardEventModifier, CesiumWidget } from 'cesium';

import {
    IFeatureSelectInteractionImplementation,
    IFeatureSelectInteractionProps,
    FEATURE_SELECT_INTERACTION_ID,
    SelectionMode,
    FeatureSelectCallback
} from '@oidajs/core';

import { cesiumInteractionsFactory } from './cesium-interactions-factory';
import { CesiumMapRenderer } from '../map/cesium-map-renderer';

import { getPickInfo, PickInfo, pickCoordinate } from '../utils';

export class CesiumFeatureSelectInteraction implements IFeatureSelectInteractionImplementation {
    private viewer_: CesiumWidget;
    private handler_: ScreenSpaceEventHandler | undefined;
    private onFeatureSelect_: FeatureSelectCallback;
    private multiple_: boolean;
    private lastSelectedFeatureIdx_ = -1;

    constructor(props: IFeatureSelectInteractionProps<CesiumMapRenderer>) {
        this.viewer_ = props.mapRenderer.getViewer();
        this.onFeatureSelect_ = props.onFeatureSelect;
        this.multiple_ = false;
    }

    setActive(active) {
        if (active) {
            this.bindClick_();
        } else {
            if (this.handler_) {
                this.handler_.destroy();
                delete this.handler_;
            }
        }
    }

    setMultiple(multiple) {
        this.multiple_ = multiple;
        if (this.handler_) {
            this.bindClick_();
        }
    }

    destroy() {
        this.setActive(false);
    }

    protected bindClick_() {
        if (this.handler_) {
            this.handler_.destroy();
        }

        this.handler_ = new ScreenSpaceEventHandler(this.viewer_.scene.canvas);

        this.handler_.setInputAction(this.selectClickedEntity_.bind(this, SelectionMode.Replace), ScreenSpaceEventType.LEFT_CLICK);

        if (this.multiple_) {
            this.handler_.setInputAction(
                this.selectClickedEntity_.bind(this, SelectionMode.Toggle),
                ScreenSpaceEventType.LEFT_CLICK,
                KeyboardEventModifier.CTRL
            );

            this.handler_.setInputAction(
                this.selectClickedEntity_.bind(this, SelectionMode.Add),
                ScreenSpaceEventType.LEFT_CLICK,
                KeyboardEventModifier.SHIFT
            );
        }
    }

    protected selectClickedEntity_(selectionMode, movement) {
        const pickedObjects = this.viewer_.scene.drillPick(movement.position, 20);

        const pickInfos: PickInfo[] = pickedObjects
            .map((pickedObject) => getPickInfo(pickedObject))
            .filter((pickInfo) => !!pickInfo && pickInfo.pickable) as PickInfo[];

        if (pickInfos.length) {
            if (selectionMode === SelectionMode.Replace) {
                this.lastSelectedFeatureIdx_ = (this.lastSelectedFeatureIdx_ + 1) % pickInfos.length;
                const pickInfo = pickInfos[this.lastSelectedFeatureIdx_];

                const layer = pickInfo.layer;
                if (layer && layer.shouldReceiveFeatureSelectEvents()) {
                    const coordinate = pickCoordinate(this.viewer_, movement.position, layer.getFeaturePickMode(), pickedObjects);
                    if (coordinate) {
                        layer.onFeatureSelect(coordinate, pickInfo);
                    }
                }

                this.onFeatureSelect_({
                    feature: {
                        id: pickInfo.id,
                        data: pickInfo.data
                    },
                    mode: selectionMode
                });
            } else {
                this.lastSelectedFeatureIdx_ = -1;
                pickInfos.forEach((pickInfo) => {
                    this.onFeatureSelect_({
                        feature: {
                            id: pickInfo.id,
                            data: pickInfo.data
                        },
                        mode: selectionMode
                    });
                });
            }
        } else {
            this.lastSelectedFeatureIdx_ = -1;
            this.onFeatureSelect_({
                feature: undefined,
                mode: selectionMode
            });
        }
    }
}

cesiumInteractionsFactory.register(FEATURE_SELECT_INTERACTION_ID, (config) => {
    return new CesiumFeatureSelectInteraction(config);
});
