import React, { useEffect, useRef } from 'react';
import { reaction } from 'mobx';
import classNames from 'classnames';
import useDimensions from 'react-cool-dimensions';

import { Map, MapRendererController } from '@oidajs/state-mobx';

import { useMapModule } from '../hooks';

export type MapComponentProps = {
    mapState: Map;
    className?: string;
    style?: React.CSSProperties;
};

export const MapComponent = (props: MapComponentProps) => {
    const { mapState, className, style } = props;

    const { observe, width, height } = useDimensions();

    const mapContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentContainer = mapContainer.current;
        if (currentContainer) {
            mapState.view.setDomTarget(currentContainer);
            let rendererController: MapRendererController | undefined = new MapRendererController({
                state: mapState
            });
            // currently we don't support multiple renderer controllers for the same map state
            // when the map target changes, we destroy the map renderer controller and we wait
            // for the map target to become undefined (i.e. the other map component is destroyed) to reinitialize it
            const targetStolenReactionDisposer = reaction(
                () => mapState.view.target,
                (target) => {
                    if (!target) {
                        // the map state is again available. we restart the map rendering controller
                        mapState.view.setDomTarget(currentContainer);
                        rendererController = new MapRendererController({
                            state: mapState
                        });
                    } else if (target !== currentContainer && rendererController) {
                        // someone stole our map state. we stop map rendering in our component
                        rendererController.destroy();
                        rendererController = undefined;
                    }
                }
            );

            return () => {
                targetStolenReactionDisposer();
                if (rendererController) {
                    rendererController.destroy();
                }
                mapState.view.setDomTarget(undefined);
            };
        }
    }, [mapState]);

    useEffect(() => {
        if (width && height) {
            mapState.renderer.implementation?.updateSize();
        }
    }, [width, height]);

    return (
        <div
            className={classNames('map-widget', className)}
            style={style}
            ref={(el) => {
                observe(el);
                // @ts-ignore
                mapContainer.current = el;
            }}
        ></div>
    );
};

export const MapComponentFromModule = (props: Omit<MapComponentProps, 'mapState'> & { mapModuleId?: string }) => {
    const { mapModuleId, ...others } = props;

    const mapModuleState = useMapModule(mapModuleId);

    return <MapComponent mapState={mapModuleState.map} {...others}></MapComponent>;
};
