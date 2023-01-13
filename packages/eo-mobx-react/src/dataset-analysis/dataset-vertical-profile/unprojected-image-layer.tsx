import React, { useRef, useEffect, useState } from 'react';

import { listen, unlistenByKey } from 'ol/events';
import EventType from 'ol/pointer/EventType';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import Projection from 'ol/proj/Projection';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import TileSource from 'ol/source/Tile';

import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { getVectorContext } from 'ol/render';

import useDimensions from 'react-cool-dimensions';

import { olTileSourcesFactory, refreshTileSource } from '@oidajs/map-ol';

export type UnprojectedImageLayerProps = {
    sourceConfig: any;
    sourceRevision: number;
    onMouseCoord?: (coord?) => void;
    onMouseClick?: (coord?) => void;
    highlightedCoord?: number[];
    selectedCoord?: number[];
    style: {
        horizontalSeriesColor: string;
        verticalSeriesColor: string;
        highlightCoordColor: string;
        selectedCoordColor: string;
    };
};

type MapType = Map & {
    horizontalLine_?: LineString;
    verticalLine_?: LineString;
    cursorCoord_?: Point;
    selectedCoord_?: Point;
};

export const UnprojectedImageLayer = (props: UnprojectedImageLayerProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<MapType>();
    const { observe, width, height } = useDimensions();

    useEffect(() => {
        const tileLayer = new TileLayer();

        const map: MapType = new Map({
            layers: [tileLayer],
            target: mapContainer.current || undefined,
            controls: []
        });
        setMap(map);

        const cursorStyle = new Style({
            image: new CircleStyle({
                radius: 3,
                fill: new Fill({ color: props.style.highlightCoordColor }),
                stroke: new Stroke({
                    color: 'black',
                    width: 1
                })
            })
        });

        const selectStyle = new Style({
            image: new CircleStyle({
                radius: 5,
                fill: new Fill({ color: props.style.selectedCoordColor }),
                stroke: new Stroke({
                    color: 'black',
                    width: 1
                })
            })
        });

        const horizontalLineStyle = new Style({
            stroke: new Stroke({
                color: props.style.horizontalSeriesColor,
                width: 1
            })
        });

        const verticalLineStyle = new Style({
            stroke: new Stroke({
                color: props.style.verticalSeriesColor,
                width: 1
            })
        });

        tileLayer.on('postrender', (event) => {
            const vectorContext = getVectorContext(event);

            if (map.horizontalLine_) {
                vectorContext.setStyle(horizontalLineStyle);
                vectorContext.drawGeometry(map.horizontalLine_);
            }
            if (map.verticalLine_) {
                vectorContext.setStyle(verticalLineStyle);
                vectorContext.drawGeometry(map.verticalLine_);
            }
            if (map.selectedCoord_) {
                vectorContext.setStyle(selectStyle);
                vectorContext.drawGeometry(map.selectedCoord_);
            }

            if (map.cursorCoord_) {
                vectorContext.setStyle(cursorStyle);
                vectorContext.drawGeometry(map.cursorCoord_);
            }
        });
    }, []);

    useEffect(() => {
        if (!map) {
            return;
        }

        let potentialClick = false;
        const viewport = map.getViewport();

        const downListener = listen(viewport, EventType.POINTERDOWN, () => {
            potentialClick = true;
        });

        const moveListener = listen(viewport, EventType.POINTERMOVE, (evt) => {
            const px = map.getEventPixel(evt as UIEvent);
            const coord = map.getCoordinateFromPixel(px);
            if (props.onMouseCoord) {
                if (map.selectedCoord_) {
                    const selectedCoord = map.selectedCoord_.getCoordinates();
                    const mapRes = map.getView().getResolution();
                    const snapThreshold = 5 * (mapRes || 1);
                    if (Math.abs(coord[0] - selectedCoord[0]) < snapThreshold) {
                        coord[0] = selectedCoord[0];
                    }
                    if (Math.abs(coord[1] - selectedCoord[1]) < snapThreshold) {
                        coord[1] = selectedCoord[1];
                    }
                }
                props.onMouseCoord(coord);
            }
            potentialClick = false;
        });

        const upListener = listen(viewport, EventType.POINTERUP, (evt) => {
            if (potentialClick) {
                potentialClick = false;
                const px = map.getEventPixel(evt as UIEvent);
                const coord = map.getCoordinateFromPixel(px);
                if (props.onMouseClick) {
                    props.onMouseClick(coord);
                }
            }
        });

        const outListener = listen(viewport, EventType.POINTEROUT, () => {
            if (props.onMouseCoord) {
                props.onMouseCoord(undefined);
            }
        });

        return () => {
            unlistenByKey(moveListener);
            unlistenByKey(outListener);
            unlistenByKey(downListener);
            unlistenByKey(upListener);
        };
    }, [map, props.onMouseCoord, props.onMouseClick]);

    useEffect(() => {
        if (!props.sourceConfig || !map) {
            return;
        }

        const { id, ...config } = props.sourceConfig;

        const tileSource = olTileSourcesFactory.create(id, config);

        const extent = config.tileGrid.extent;

        const projection = new Projection({
            code: config.srs,
            units: 'pixels',
            extent: extent
        });

        const layer = map.getLayers().item(0) as TileLayer<TileSource>;
        layer.setSource(tileSource || null);
        layer.setExtent(extent);

        map.setView(
            new View({
                extent: extent,
                center: [extent[0], extent[1]],
                projection: projection
            })
        );

        map.getView().fit(extent);
        map.getView().setCenter([0, 0]);
    }, [props.sourceConfig, map]);

    useEffect(() => {
        if (!map) {
            return;
        }

        const layer = map.getLayers().item(0) as TileLayer<TileSource>;
        const tileSource = layer.getSource();

        if (tileSource) {
            refreshTileSource(tileSource);
        }
    }, [props.sourceRevision]);

    useEffect(() => {
        if (map) {
            if (props.highlightedCoord) {
                map.cursorCoord_ = new Point(props.highlightedCoord);
            } else {
                delete map.cursorCoord_;
            }
            map.render();
        }
    }, [props.highlightedCoord]);

    useEffect(() => {
        if (map) {
            if (props.selectedCoord) {
                const mapExtent = map.getView().getProjection().getExtent();
                map.selectedCoord_ = new Point(props.selectedCoord);
                map.horizontalLine_ = new LineString([
                    [mapExtent[0], props.selectedCoord[1]],
                    [mapExtent[2], props.selectedCoord[1]]
                ]);
                map.verticalLine_ = new LineString([
                    [props.selectedCoord[0], mapExtent[1]],
                    [props.selectedCoord[0], mapExtent[3]]
                ]);
                map.getView().animate(
                    {
                        center: props.selectedCoord
                    },
                    () => {
                        map.getView().setCenter(props.selectedCoord);
                    }
                );
            } else {
                delete map.selectedCoord_;
                delete map.horizontalLine_;
                delete map.verticalLine_;
            }
            map.render();
        }
    }, [props.selectedCoord]);

    useEffect(() => {
        if (map) {
            map.updateSize();
        }
    }, [width, height]);

    return (
        <div
            className={'unprojected-image-layer-widget'}
            ref={(el) => {
                observe(el);
                // @ts-ignore
                mapContainer.current = el;
            }}
        />
    );
};
