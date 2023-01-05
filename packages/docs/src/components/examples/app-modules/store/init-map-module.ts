import { MapBaseLayerConfig, MapModule } from '@oidajs/ui-react-mobx';

export const initMapModule = () => {
    const mapProjections = [
        { name: 'Geographic', code: 'EPSG:4326' },
        { name: 'Mercator', code: 'EPSG:900913' }
    ];

    const baseLayers: MapBaseLayerConfig[] = [
        {
            id: 'osm',
            name: 'OSM',
            source: {
                id: 'osm'
            }
        },
        {
            id: 'bing',
            name: 'Bing',
            source: {
                id: 'bing',
                imagerySet: 'Aerial',
                key: 'AmEV-s101vB0DGqgW8Y9rjCWBg3ZinPm_y-QM6RXHmds_mSiZDbYxeEFcugx10rr'
            }
        }
    ];

    const renderers = [
        {
            id: 'ol',
            name: 'OL'
        },
        {
            id: 'cesium',
            name: 'Cesium'
        }
    ];

    const mapModule = new MapModule({
        map: {
            renderer: {
                id: 'ol'
            },
            view: {
                viewport: {
                    center: [12, 41],
                    resolution: 3000
                },
                config: {}
            }
        },
        config: {
            baseLayers: baseLayers,
            projections: mapProjections,
            renderers: renderers,
            initialOptions: {
                baseLayer: 'osm',
                projection: 'EPSG:900913',
                renderer: 'ol'
            }
        }
    });

    return mapModule;
};
