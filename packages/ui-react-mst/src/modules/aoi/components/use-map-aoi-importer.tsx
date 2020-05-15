import { useEffect } from 'react';
import { useObserver } from 'mobx-react';

import { LoadingState, AoiValue, AoiAction, FormFieldState } from '@oida/core';

import { AoiImportConfig } from '@oida/ui-react-core';

import { useEntityCollectionList, useDataFiltering, useDataPaging, useDataSorting } from '../../../core/components';
import { useCenterOnMap } from '../../map';
import { IAOI } from '../types';
import { createInMemoryAoiProvider } from '../utils';
import { useAoiModuleState, IAoiModuleState } from '../use-aoi-module-state';

export type MapAoiImporterProps = {
    aoiModule: IAoiModuleState,
    onActiveActionChange: (action: AoiAction) => void
} & FormFieldState<AoiValue>;

export const useMapAoiImporter = (props: MapAoiImporterProps) => {

    useEffect(() => {
        return () => {
            props.aoiModule.setActiveSource(undefined);
        };
    }, []);

    let sourceGroups = useObserver(() => {
        return props.aoiModule.aoiSources.items.map((aoiSource) => {
            return {
                id: aoiSource.id,
                name: aoiSource.name
            };
        });
    });

    const onAoiImportAction = (aoi) => {

        props.onChange({
            geometry: aoi.geometry,
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

    const selectedSourceGroup = useObserver(() => {
        return props.aoiModule.activeSource;
    });

    const centerOnMap = useCenterOnMap({
        map: props.aoiModule.map
    });

    const onAoiCenterOnMapAction = (aoi) => {
        centerOnMap(aoi.geometry, {
            animate: true
        });
    };

    const aoiParsers = props.aoiModule.config.aoiParsers;

    const onFileImportAction = aoiParsers && aoiParsers.length ? (file: File) => {

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

                let nextParserIdx = 0;

                const tryParse = () => {
                    let parser;
                    do {
                        parser = aoiParsers[nextParserIdx];
                        nextParserIdx++;
                    } while (parser && !parser.supportedFileTypes.includes(fileExtension));

                    if (!parser) {
                        reject('Unrecognized file format');
                    } else {
                        parser.parse(file).then((data) => {
                            let aoiSourceProvider = createInMemoryAoiProvider(data);

                            let propertyKeys;
                            if (data.length) {
                                let properties = data[0].properties || {};
                                propertyKeys = Object.keys(properties);
                            }
                            props.aoiModule.aoiSources.add({
                                id: file.name,
                                name: file.name,
                                queryParams: {
                                    paging: {
                                        pageSize: 50
                                    }
                                },
                                config: {
                                    provider: aoiSourceProvider,
                                    propertyKeys: propertyKeys
                                }
                            });

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

    let items = useEntityCollectionList<IAOI>({
        collection: selectedSourceGroup ? selectedSourceGroup.aois : undefined,
        entitySelection: props.aoiModule.mapModule.selection,
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
    if (selectedSourceGroup && selectedSourceGroup.config.propertyKeys) {
        filters.unshift(...selectedSourceGroup.config.propertyKeys.map((key) => {
            return {
                name: key,
                title: key.toLowerCase(),
                type: 'string',
                config: {}
            };
        }));

        sortableFields = selectedSourceGroup.config.propertyKeys.map((key) => {
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

    let loadingState = useObserver(() => {
        return selectedSourceGroup ? selectedSourceGroup.loadingState : LoadingState.Init;
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

    let supportedFileTypes = aoiParsers && aoiParsers.reduce((fileTypes, parser) => {
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


export const useMapAoiImporterFromModule = (props: Omit<MapAoiImporterProps, 'aoiModule'>, aoiModule?) => {
    let moduleState = useAoiModuleState(aoiModule);

    return useMapAoiImporter({
        aoiModule: moduleState,
        ...props
    });
};
