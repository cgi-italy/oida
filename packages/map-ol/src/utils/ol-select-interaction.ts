import Interaction from 'ol/interaction/Interaction';
import { singleClick, pointerMove } from 'ol/events/condition';
import Event from 'ol/events/Event';
import MapBrowserEvent from 'ol/MapBrowserEvent';

import { OLFeatureLayer } from '../layers/ol-feature-layer';
import { FeatureLike } from 'ol/Feature';

export class OLSelectEvent extends Event {
    public selected: FeatureLike[];
    public selectionMode;
    public mapBrowserEvent: MapBrowserEvent<UIEvent>;

    constructor(selected: FeatureLike[], mapBrowserEvent: MapBrowserEvent<UIEvent>) {
        super('select');

        this.selected = selected;
        this.mapBrowserEvent = mapBrowserEvent;
    }
}

export type OLSelectInteractionConfig = {
    condition?: (mapBrowserEvent: MapBrowserEvent<any>) => boolean;
    hitTolerance?: number;
    drillPick?: boolean;
};

export class OLSelectInteraction extends Interaction {
    private condition_: (mapBrowserEvent: MapBrowserEvent<any>) => boolean;
    private hitTolerance_: number;
    private drillPick_: boolean;

    constructor(options: OLSelectInteractionConfig) {
        super({
            handleEvent: (mapBrowserEvent) => {
                return this.handleEvent_(mapBrowserEvent);
            }
        });

        this.hitTolerance_ = options.hitTolerance ? options.hitTolerance : 0;
        this.condition_ = options.condition || singleClick;
        this.drillPick_ = options.drillPick || false;
    }

    protected handleEvent_(mapBrowserEvent: MapBrowserEvent<UIEvent>) {
        if (!this.condition_(mapBrowserEvent)) {
            return true;
        }

        const map = mapBrowserEvent.map;

        const selected: FeatureLike[] = [];

        map.forEachFeatureAtPixel(
            mapBrowserEvent.pixel,
            (feature) => {
                if (feature && !feature.get(OLFeatureLayer.FEATURE_PICKING_DISABLED_KEY)) {
                    selected.push(feature);
                    return !this.drillPick_;
                }
            },
            {
                hitTolerance: this.hitTolerance_
            }
        );

        super.dispatchEvent(new OLSelectEvent(this.drillPick_ ? selected : selected.slice(0, 1), mapBrowserEvent));

        return pointerMove(mapBrowserEvent);
    }
}
