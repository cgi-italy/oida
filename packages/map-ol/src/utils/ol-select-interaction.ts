import Interaction from 'ol/interaction/Interaction';
import { singleClick, pointerMove } from 'ol/events/condition';
import Event from 'ol/events/Event';

import { OLFeatureLayer } from '../layers/ol-feature-layer';

class SelectEvent extends Event {
    public selected;
    public selectionMode;
    public mapBrowserEvent;

    constructor(type, selected, mapBrowserEvent) {
        super(type);

        this.selected = selected;
        this.mapBrowserEvent = mapBrowserEvent;
    }
}

export class OLSelectInteraction extends Interaction {
    private condition_;
    private hitTolerance_: number;
    private drillPick_: boolean;

    constructor(options) {
        super({
            handleEvent: (mapBrowserEvent) => {
                return this.handleEvent_(mapBrowserEvent);
            }
        });

        this.hitTolerance_ = options.hitTolerance ? options.hitTolerance : 0;
        this.condition_ = options.condition || singleClick;
        this.drillPick_ = options.drillPick || false;
    }

    protected handleEvent_(mapBrowserEvent) {
        if (!this.condition_(mapBrowserEvent)) {
            return true;
        }

        const map = mapBrowserEvent.map;

        const selected: any[] = [];

        map.forEachFeatureAtPixel(
            mapBrowserEvent.pixel,
            (feature, layer) => {
                if (feature && !feature.get(OLFeatureLayer.FEATURE_PICKING_DISABLED_KEY)) {
                    selected.push(feature);
                    return !this.drillPick_;
                }
            },
            {
                hitTolerance: this.hitTolerance_
            }
        );

        super.dispatchEvent(new SelectEvent('select', this.drillPick_ ? selected : selected[0], mapBrowserEvent));

        return pointerMove(mapBrowserEvent);
    }
}
