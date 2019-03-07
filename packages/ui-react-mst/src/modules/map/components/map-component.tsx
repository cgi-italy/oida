import React from 'react';
import  classNames from 'classnames';

//imported to avoid an issue with generated typings declaration
import { IMapRenderer } from '@oida/core';

import { IMap, MapRendererController } from '@oida/state-mst';

export interface MapComponentProps {
    mapState: IMap;
    className?: string;
}

export class MapComponent extends React.PureComponent<MapComponentProps> {

    private mapContainer_: HTMLElement;
    private rendererController_: MapRendererController;

    constructor(props: MapComponentProps) {
        super(props);
    }

    getRenderer() {
        return this.rendererController_.getMapRenderer();
    }

    componentDidMount() {
        this.rendererController_ = new MapRendererController({
            state: this.props.mapState
        });
        this.rendererController_.setDomTarget(this.mapContainer_);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.mapState !== this.props.mapState) {
            this.rendererController_.destroy();
            this.rendererController_ = new MapRendererController({
                state: this.props.mapState
            });
        }
        this.rendererController_.setDomTarget(this.mapContainer_);
    }

    componentWillUnmount() {
        this.rendererController_.destroy();
    }

    render() {
        return (
            <div
                className={classNames('map-widget', this.props.className)}
                style={{ width: '100%', height: '100%' }}
                ref={(element) => this.mapContainer_ = element}
            ></div>
        );
    }
}

