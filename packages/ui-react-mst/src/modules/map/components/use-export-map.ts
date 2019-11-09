import React from 'react';

import { useObserver } from 'mobx-react-lite';

import download from 'downloadjs';

import { IMap } from '@oida/state-mst';

import { useMapModuleState } from '../use-map-module-state';

export type ExportMapProps = {
    map: IMap;
    format?: string;
    fileName?: string;
};

export const useExportMap = (props: ExportMapProps) => {

    let target = useObserver(() => {
        return props.map.view.target;
    });

    return () => {
        if (target) {
            let canvas = target.querySelector('canvas');
            if (canvas) {
                let format = props.format || 'image/png';

                let extensionFromMimeType = format.match(/\/(.*)$/);
                let extension = '';
                if (extensionFromMimeType) {
                    extension = `.${extensionFromMimeType[1]}`;
                }
                let fileName = props.fileName || `map${extension}`;

                let img = canvas.toDataURL(format);
                download(img, fileName, format);
            }
        }
    };
};

export const useExportMapFromModule = (mapModule?) => {
    let mapModuleState = useMapModuleState(mapModule);
    return useExportMap({
        map: mapModuleState.map
    });
};
