
import Interaction from 'ol/interaction/Interaction';
import { singleClick, pointerMove } from 'ol/events/condition';
import Event from 'ol/events/Event';

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

    constructor(options) {
        super({
            handleEvent: (mapBrowserEvent) => {
                return this.handleEvent_(mapBrowserEvent);
            }
        });

        this.hitTolerance_ = options.hitTolerance ? options.hitTolerance : 0;
        this.condition_ = options.condition || singleClick;
    }

    protected handleEvent_(mapBrowserEvent) {
        if (!this.condition_(mapBrowserEvent)) {
            return true;
        }

        let map = mapBrowserEvent.map;

        let selected = null;

        map.forEachFeatureAtPixel(mapBrowserEvent.pixel, (feature, layer) => {
            if (feature && !feature.get('pickingDisabled')) {
                selected = feature;
                return true;
            }
        }, {
            hitTolerance: this.hitTolerance_
        });

        super.dispatchEvent(
            new SelectEvent('select', selected, mapBrowserEvent)
        );

        return pointerMove(mapBrowserEvent);
    }

}
