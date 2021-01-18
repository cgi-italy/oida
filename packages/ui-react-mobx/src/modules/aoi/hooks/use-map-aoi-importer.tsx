import { useEffect } from 'react';

import { LoadingState, AoiValue, AoiAction, FormFieldState } from '@oida/core';

import { AoiImportConfig } from '@oida/ui-react-core';

import { useEntityCollectionList, useDataFiltering, useDataPaging, useDataSorting, useSelector } from '../../../core/hooks';
import { useCenterOnMap } from '../../map';
import { Aoi, AoiSource } from '../models';
import { createInMemoryAoiProvider } from '../utils';
import { useAoiModule } from './use-aoi-module';
import { AoiModule, AoiFormat } from '../aoi-module';

export type MapAoiImporterProps = {
    aoiModule: AoiModule,
    onActiveActionChange: (action: AoiAction) => void
} & FormFieldState<AoiValue>;

const useMapAoiImporterBase = (props: MapAoiImporterProps) => {

    useEffect(() => {
        return () => {
            props.aoiModule.setActiveSource(undefined);
        };
    }, []);

    let sourceGroups = useSelector(() => {
        return props.aoiModule.aoiSources.items.map((aoiSource) => {
            return {
                id: aoiSource.id,
                name: aoiSource.name
            };
        });
    });

    const onAoiImportAction = (aoi) => {

        props.onChange({
            geometry: aoi.geometry.value,
            props: {
                name: aoi.name
            }
        });

        props.onActiveActionChange(AoiAction.None);
    };

    const onImportCancel = () => {
        props.aoiModule.setActiveSource(undefined);
    };

    const onSourceGroupSelect = (sourceGroup: string) => {
        props.aoiModule.setActiveSource(sourceGroup);
    };

    const selectedSourceGroup = useSelector(() => {
        return props.aoiModule.activeSource;
    });

    const centerOnMap = useCenterOnMap({
        map: props.aoiModule.mapModule.map
    });

    const onAoiCenterOnMapAction = (aoi) => {
        centerOnMap(aoi.geometry.value, {
            animate: true
        });
    };

    const aoiFormats = props.aoiModule.config.aoiFormats;

    const onFileImportAction = aoiFormats && aoiFormats.length ? (file: File) => {

        return new Promise((resolve, reject) => {

            if (props.aoiModule.aoiSources.itemWithId(file.name)) {
                props.aoiModule.setActiveSource(file.name);
                resolve();
                return;
            }

            let extensionRegex = /\.([^\.]*)$/;
            let fileExtensionMatch = file.name.match(extensionRegex);
            if (fileExtensionMatch) {
                let fileExtension = fileExtensionMatch[1].toLowerCase();

                let nextFormatIdx = 0;

                const tryParse = () => {
                    let format: AoiFormat;
                    do {
                        format = aoiFormats[nextFormatIdx];
                        nextFormatIdx++;
                    } while (format && !format.supportedFileTypes.includes(fileExtension));

                    if (!format) {
                        reject('Unrecognized file format');
                    } else {
                        format.parser(file).then((data) => {
                            let aoiSourceProvider = createInMemoryAoiProvider(data);

                            let propertiesSchema: Record<string, any> = {};
                            if (data.length) {
                                let properties = data[0].properties || {};
                                propertiesSchema = Object.keys(properties).reduce((schema, key) => {
                                    return {
                                        [key]: {},
                                        ...schema
                                    };
                                }, propertiesSchema);
                            }
                            props.aoiModule.aoiSources.add(new AoiSource({
                                id: file.name,
                                name: file.name,
                                queryParams: {
                                    paging: {
                                        pageSize: 50
                                    }
                                },
                                provider: aoiSourceProvider,
                                propertiesSchema: propertiesSchema
                            }));

                            props.aoiModule.setActiveSource(file.name);

                            resolve();
                        }).catch(() => {
                            tryParse();
                        });
                    }
                };

                tryParse();
            } else {
                reject('Unrecognized file format');
            }
        });
    } : undefined;

    let selectedSourceGroupItems;

    let items = useEntityCollectionList<Aoi>({
        items: selectedSourceGroup ? selectedSourceGroup.aois.items : undefined,
        selectionManager: props.aoiModule.mapModule.selectionManager,
    });

    let paging = useDataPaging(selectedSourceGroup ? selectedSourceGroup.queryParams.paging : undefined);

    let filters = [{
        name: 'geometryType',
        title: 'Geometry',
        type: 'enum',
        config: {
            choices: [
                {name: 'Point', value: 'Point'},
                {name: 'LineString', value: 'LineString'},
                {name: 'Polygon', value: 'Polygon'},
                {name: 'MultiPoint', value: 'MultiPoint'},
                {name: 'MultiLineString', value: 'MultiLineString'},
                {name: 'MultiPolygon', value: 'MultiPolygon'}
            ],
            multiple: true
        }
    }] as any;

    let sortableFields;
    if (selectedSourceGroup && selectedSourceGroup.propertiesSchema) {
        filters.unshift(...Object.keys(selectedSourceGroup.propertiesSchema).map((key) => {
            return {
                name: key,
                title: key.toLowerCase(),
                type: 'string',
                config: {}
            };
        }));

        sortableFields = Object.keys(selectedSourceGroup.propertiesSchema).map((key) => {
            return {
                key: key,
                name: key.toLowerCase()
            };
        });

    } else {
        filters.unshift({
            name: 'name',
            title: 'Name',
            type: 'string',
            config: {}
        });

        sortableFields = [
            {key: 'name', name: 'Name'}
        ];
    }
    let filtering = useDataFiltering({
        filters: filters,
        filteringState: selectedSourceGroup ? selectedSourceGroup.queryParams.filters : undefined
    });

    let sorting = useDataSorting({
        sortableFields: sortableFields,
        sortingState: selectedSourceGroup ? selectedSourceGroup.queryParams.sorting : undefined
    });

    let loadingState = useSelector(() => {
        return selectedSourceGroup ? selectedSourceGroup.loadingStatus.value : LoadingState.Init;
    });

    if (items) {
        selectedSourceGroupItems = {
            items: {
                loadingState,
                ...items
            },
            filters: filtering,
            sorting,
            paging
        };
    }

    let supportedFileTypes = aoiFormats && aoiFormats.reduce((fileTypes, parser) => {
        return [...fileTypes, ...parser.supportedFileTypes];
    }, [] as string[]);

    return {
        onAoiImportAction: onAoiImportAction,
        onFileImportAction: onFileImportAction,
        onAoiCenterOnMapAction: onAoiCenterOnMapAction,
        onImportCancel: onImportCancel,
        onSourceGroupSelect: onSourceGroupSelect,
        sourceGroups: sourceGroups,
        selectedSourceGroup: selectedSourceGroup ? selectedSourceGroup.id : undefined,
        selectedSourceGroupItems: selectedSourceGroupItems,
        supportedFileTypes: supportedFileTypes
    } as AoiImportConfig;
};


export const useMapAoiImporter = (props: Omit<MapAoiImporterProps, 'aoiModule'>, aoiModuleId?: string) => {
    let moduleState = useAoiModule(aoiModuleId);

    return useMapAoiImporterBase({
        aoiModule: moduleState,
        ...props
    });
};
