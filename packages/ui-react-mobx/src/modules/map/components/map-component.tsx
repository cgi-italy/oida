import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import useResizeAware from 'react-resize-aware';

import { Map, MapRendererController } from '@oidajs/state-mobx';
import { useMapModule } from '../hooks';

export type MapComponentProps = {
    mapState: Map;
    className?: string;
    style?: React.CSSProperties;
};

export const MapComponent = (props: MapComponentProps) => {
    const { mapState, className, style } = props;

    const [resizeListener, size] = useResizeAware();

    const mapContainer = useRef<HTMLDivElement>(null);
    let rendererController: MapRendererController;

    useEffect(() => {
        if (size && size.width && size.height) {
            mapState.view.setDomTarget(mapContainer.current || undefined);
        } else {
            mapState.view.setDomTarget(undefined);
        }

        return () => {
            mapState.view.setDomTarget(undefined);
        };
    }, [mapState, mapContainer]);

    useEffect(() => {
        rendererController = new MapRendererController({
            state: mapState
        });

        return () => {
            rendererController.destroy();
        };
    }, [mapState]);

    useEffect(() => {
        if (size && size.width && size.height) {
            if (!mapState.view.target) {
                mapState.view.setDomTarget(mapContainer.current || undefined);
            } else {
                mapState.renderer.implementation?.updateSize();
            }
        } else {
            mapState.view.setDomTarget(undefined);
        }
    }, [size]);

    return (
        <div className={classNames('map-widget', className)} style={style} ref={mapContainer}>
            {resizeListener}
        </div>
    );
};

export const MapComponentFromModule = (props: Omit<MapComponentProps, 'mapState'> & { mapModuleId?: string }) => {
    const { mapModuleId, ...others } = props;

    const mapModuleState = useMapModule(mapModuleId);

    return <MapComponent mapState={mapModuleState.map} {...others}></MapComponent>;
};
