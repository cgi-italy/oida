import { DataCollectionProps } from '../data-collection';

export type AoiImportConfig = {
    onFileImportAction?: (files) => Promise<void>;
    onAoiImportAction: (aoi) => void;
    onAoiCenterOnMapAction?: (aoi) => void;
    onImportCancel?: () => void;
    onSourceGroupSelect: (group: string) => void;
    selectedSourceGroup: string;
    sourceGroups: any[];
    selectedSourceGroupItems?: DataCollectionProps<any>;
    supportedFileTypes: string[];
};
