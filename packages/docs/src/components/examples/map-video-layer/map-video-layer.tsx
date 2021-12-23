import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { LoadingState } from '@oidajs/core';
import { Map, TileLayer } from '@oidajs/state-mobx';
import { AdaptiveVideoLayer } from '@oidajs/eo-video';

import { MapComponent } from '@oidajs/ui-react-mobx';

import '@oidajs/map-ol';
import '../antd.less';

const mapState = new Map({
    renderer: {
        id: 'ol',
        options: {}
    },
    view: {
        projection: {
            code: 'EPSG:4326'
        },
        viewport: {
            center: [12, 42],
            resolution: 3000
        },
        config: {
            animateOnChange: true
        }
    }
});

//https://storage.googleapis.com/shaka-demo-assets/sintel/dash.mpd
//http://www.bok.net/dash/tears_of_steel/cleartext/stream.mpd
//https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd
//https://dash.akamaized.net/akamai/4k/redbull/redbull.mpd
//https://dash.akamaized.net/akamai/4k/spring/spring.mpd

mapState.layers.children.add([
    new TileLayer({
        id: 'base',
        source: {
            id: 'osm'
        },
        hovered: true
    })
]);

type VideoControlsProps = {
    videoLayer: AdaptiveVideoLayer;
};

const VideoControls = observer((props: VideoControlsProps) => {
    return (
        <div>
            <Button
                onClick={() => {
                    props.videoLayer.isPlaying ? props.videoLayer.stop() : props.videoLayer.play();
                }}
                disabled={!props.videoLayer.ready}
            >
                Start/Stop video
            </Button>
            {props.videoLayer.mapLayer.loadingStatus.value === LoadingState.Loading && <LoadingOutlined />}
        </div>
    );
});

const MapVideoLayer = () => {
    const [videoLayer, setVideoLayer] = useState<AdaptiveVideoLayer>();

    useEffect(() => {
        const videoLayer = new AdaptiveVideoLayer({
            id: 'video',
            mapState: mapState,
            videoSource: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
            footprints: [
                [
                    [12, 42],
                    [12.5, 42.1],
                    [12.4, 42.7],
                    [11.8, 42.5]
                ]
            ],
            frameRate: 30
        });

        mapState.layers.children.add(videoLayer.mapLayer);
        setVideoLayer(videoLayer);

        window['videoLayer'] = videoLayer;

        return () => {
            videoLayer.dispose();
        };
    }, []);

    return (
        <div>
            {videoLayer && <VideoControls videoLayer={videoLayer} />}
            <MapComponent style={{ height: '500px', width: '600px', position: 'relative' }} mapState={mapState} />
        </div>
    );
};

export default MapVideoLayer;
