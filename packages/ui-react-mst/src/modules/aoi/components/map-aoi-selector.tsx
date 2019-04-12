import React from 'react';
import { observer } from 'mobx-react';

import { FeatureDrawMode, FeatureDrawEvent, SelectionMode, FEATURE_DRAW_INTERACTION_ID } from '@oida/core';

import { IMap, IFeatureDrawInteraction, IEntitySelection } from '@oida/state-mst';
import { FormFieldRenderer, AoiField, AoiAction }  from '@oida/ui-react-core';

import { AoiModule, DefaultAoiModule } from '../aoi-module';
import { injectFromModuleState } from '../../with-app-module';

import { IAOICollection, IAOI } from '../types/aoi';


export type AoiSelectorProps = Pick<AoiField, Exclude<keyof AoiField, 'config' | 'type'>> & {
    mapState: IMap;
    drawInteraction: IFeatureDrawInteraction;
    mapSelection: IEntitySelection;
    aois: IAOICollection;
    render: FormFieldRenderer<AoiField>
};

let nextAoiId = 1;

class AoiSelectorBase extends React.Component<AoiSelectorProps, {aoi: IAOI | undefined, activeAction: AoiAction}> {

    private aoiId_: string;

    constructor(props) {
        super(props);
        this.aoiId_ = `${nextAoiId++}`;

        this.state = {
            aoi: undefined,
            activeAction: AoiAction.None
        };
    }

    onDrawEnd(evt: FeatureDrawEvent) {
        this.props.onChange({
            name: `${evt.geometry.type} ${this.aoiId_}`,
            geometry: evt.geometry
        });
        this.props.drawInteraction.setDrawMode(FeatureDrawMode.Off, {});
        this.setState({
            activeAction: AoiAction.None
        });
    }

    drawBBox() {

        if (this.state.activeAction === AoiAction.DrawBBox) {
            this.cancelDraw();
        } else {
            this.props.drawInteraction.setDrawMode(FeatureDrawMode.BBox, {
                onDrawEnd: this.onDrawEnd.bind(this)
            });
            this.setState({
                activeAction: AoiAction.DrawBBox
            });
        }
    }

    drawPolygon() {
        if (this.state.activeAction === AoiAction.DrawPolygon) {
            this.cancelDraw();
        } else {
            this.props.drawInteraction.setDrawMode(FeatureDrawMode.Polygon, {
                onDrawEnd: this.onDrawEnd.bind(this)
            });

            this.setState({
                activeAction: AoiAction.DrawPolygon
            });
        }
    }

    cancelDraw() {
        this.props.drawInteraction.setDrawMode(FeatureDrawMode.Off, {});
        this.setState({
            activeAction: AoiAction.None
        });
    }

    onAoiHover(hovered) {
        let aoi = this.state.aoi;
        if (hovered) {
            this.props.mapSelection.setHovered(aoi);
        } else {
            this.props.mapSelection.setHovered(null);
        }
    }

    onAoiSelect(selected) {
        let aoi = this.state.aoi;
        this.props.mapSelection.modifySelection(aoi, SelectionMode.Replace);
    }

    componentDidMount() {
        if (this.props.value) {
            this.props.aois.add({
                id: this.aoiId_,
                name: this.props.value.name,
                geometry: this.props.value.geometry
            });

            this.setState({
                aoi: this.props.aois.itemWithId(this.aoiId_)
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            let aoi = this.state.aoi;
            if (aoi) {
                if (this.props.value) {
                    aoi.setName(this.props.value.name);
                    aoi.setGeometry(this.props.value.geometry);
                } else {
                    this.props.aois.remove(aoi);
                    this.setState({
                        aoi: undefined
                    });
                }
            } else {
                if (this.props.value) {
                    this.props.aois.add({
                        id: this.aoiId_,
                        name: this.props.value.name,
                        geometry: this.props.value.geometry
                    });

                    this.setState({
                        aoi: this.props.aois.itemWithId(this.aoiId_)
                    });
                }
            }
        }
    }

    componentWillUnmount() {
        this.props.aois.remove(this.state.aoi);
    }

    render() {

        let aoi = this.state.aoi;

        let { render, mapState, drawInteraction, ...props } = this.props;

        return render({
            name: props.name,
            title: props.title,
            required: props.required,
            type: 'aoi',
            value: props.value,
            onChange: this.props.onChange,
            config: {
                onDrawBBoxAction: this.drawBBox.bind(this),
                onDrawPolygonAction: this.drawPolygon.bind(this),
                activeAction: this.state.activeAction,
                onHoverAction: this.onAoiHover.bind(this),
                onSelectAction: this.onAoiSelect.bind(this),
                color: aoi ? aoi.color : null
            }
        });
    }
}

export const MapAoiSelector = observer(AoiSelectorBase);

export const injectAoiSelectorStateFromModule = (aoiModule: AoiModule) => injectFromModuleState(aoiModule, (moduleState) => {

    let mapModule = moduleState.mapModule;

    let drawInteraction = mapModule.map.interactions.items.find((interaction) => {
        return interaction.mapInteractionType === FEATURE_DRAW_INTERACTION_ID;
    });

    return {
        mapState: mapModule.map,
        drawInteraction: drawInteraction,
        mapSelection: mapModule.selection,
        aois: moduleState.aois
    };
});

export const MapAoiSelectorS = injectAoiSelectorStateFromModule(DefaultAoiModule)(MapAoiSelector);
