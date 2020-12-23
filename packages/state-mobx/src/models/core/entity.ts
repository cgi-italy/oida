import {
    Visible, VisibleProps, HasVisibility,
    Hovered, HoveredProps, IsHoverable,
    Selected, SelectedProps, IsSelectable
} from '../mixins';


export type EntityProps = {
    id: string | number;
    entityType: string;
} & VisibleProps & HoveredProps & SelectedProps;

export class Entity implements HasVisibility, IsHoverable, IsSelectable {
    readonly id: string | number;
    readonly entityType: string;
    readonly visible: Visible;
    readonly hovered: Hovered;
    readonly selected: Selected;

    constructor(props: EntityProps) {
        this.id = props.id;
        this.entityType =  props.entityType;
        this.visible = new Visible(props);
        this.hovered = new Hovered(props);
        this.selected = new Selected(props);
    }
}

export interface IsEntity extends HasVisibility, IsHoverable, IsSelectable {
    id: string | number;
}
