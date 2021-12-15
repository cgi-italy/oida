import download from 'downloadjs';

import { Map } from '@oidajs/state-mobx';

import { useSelector } from '../../../core';
import { useMapModule } from './use-map-module';


export type ExportMapProps = {
    map: Map;
    format?: string;
    fileName?: string;
};

export const useExportMap = (props: ExportMapProps) => {

    let target = useSelector(() => {
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

export const useExportMapFromModule = (props?: Omit<ExportMapProps, 'map'>, mapModuleId?: string) => {
    let mapModuleState = useMapModule(mapModuleId);
    return useExportMap({
        map: mapModuleState.map,
        ...props
    });
};
