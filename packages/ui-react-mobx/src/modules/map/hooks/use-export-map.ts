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
    const target = useSelector(() => {
        return props.map.view.target;
    });

    return () => {
        if (target) {
            const canvas = target.querySelector('canvas');
            if (canvas) {
                const format = props.format || 'image/png';

                const extensionFromMimeType = format.match(/\/(.*)$/);
                let extension = '';
                if (extensionFromMimeType) {
                    extension = `.${extensionFromMimeType[1]}`;
                }
                const fileName = props.fileName || `map${extension}`;

                const img = canvas.toDataURL(format);
                download(img, fileName, format);
            }
        }
    };
};

export const useExportMapFromModule = (props?: Omit<ExportMapProps, 'map'>, mapModuleId?: string) => {
    const mapModuleState = useMapModule(mapModuleId);
    return useExportMap({
        map: mapModuleState.map,
        ...props
    });
};
