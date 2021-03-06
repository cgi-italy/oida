import { useEffect } from 'react';

import { AoiValue, AoiAction, FormFieldState, IFormFieldDefinition } from '@oidajs/core';
import { AoiImportConfig } from '@oidajs/ui-react-core';

import { useSelector, useEntityCollection } from '../../../core/hooks';
import { useCenterOnMap } from '../../map';
import { AoiSource } from '../models';
import { createInMemoryAoiProvider } from '../utils';
import { useAoiModule } from './use-aoi-module';
import { AoiModule, AoiFormat } from '../aoi-module';

export type MapAoiImporterProps = {
    aoiModule: AoiModule;
    activeAction: AoiAction;
    onActiveActionChange: (action: AoiAction) => void;
} & FormFieldState<AoiValue>;

const useMapAoiImporterBase = (props: MapAoiImporterProps) => {
    useEffect(() => {
        if (props.activeAction === AoiAction.Import) {
            props.aoiModule.loadLastActiveSource();
            return () => {
                props.aoiModule.setActiveSource(undefined);
            };
        }
    }, [props.activeAction]);

    const sourceGroups = useSelector(() => {
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

    const onFileImportAction =
        aoiFormats && aoiFormats.length
            ? (file: File) => {
                  return new Promise<void>((resolve, reject) => {
                      if (props.aoiModule.aoiSources.itemWithId(file.name)) {
                          props.aoiModule.setActiveSource(file.name);
                          resolve();
                          return;
                      }

                      const extensionRegex = /\.([^.]*)$/;
                      const fileExtensionMatch = file.name.match(extensionRegex);
                      if (fileExtensionMatch) {
                          const fileExtension = fileExtensionMatch[1].toLowerCase();

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
                                  format
                                      .parser(file)
                                      .then((data) => {
                                          const aoiSourceProvider = createInMemoryAoiProvider(data);

                                          let propertiesSchema: IFormFieldDefinition[] | undefined;
                                          if (data.length) {
                                              const properties = data[0].properties || {};
                                              propertiesSchema = Object.keys(properties).map((key, idx) => {
                                                  return {
                                                      name: key,
                                                      title: key,
                                                      type: 'string',
                                                      config: {}
                                                  };
                                              });
                                          }
                                          props.aoiModule.aoiSources.add(
                                              new AoiSource({
                                                  id: file.name,
                                                  name: file.name,
                                                  queryParams: {
                                                      paging: {
                                                          pageSize: 50
                                                      }
                                                  },
                                                  provider: aoiSourceProvider,
                                                  propertiesSchema: propertiesSchema
                                              })
                                          );

                                          props.aoiModule.setActiveSource(file.name);

                                          resolve();
                                      })
                                      .catch(() => {
                                          tryParse();
                                      });
                              }
                          };

                          tryParse();
                      } else {
                          reject('Unrecognized file format');
                      }
                  });
              }
            : undefined;

    const filters: IFormFieldDefinition[] = [
        {
            name: 'geometryType',
            title: 'Geometry',
            type: 'enum',
            config: {
                choices: [
                    { name: 'Point', value: 'Point' },
                    { name: 'LineString', value: 'LineString' },
                    { name: 'Polygon', value: 'Polygon' },
                    { name: 'MultiPoint', value: 'MultiPoint' },
                    { name: 'MultiLineString', value: 'MultiLineString' },
                    { name: 'MultiPolygon', value: 'MultiPolygon' }
                ],
                multiple: true
            }
        }
    ];

    let sortableFields;
    if (selectedSourceGroup && selectedSourceGroup.propertiesSchema) {
        filters.unshift(...selectedSourceGroup.propertiesSchema);

        sortableFields = selectedSourceGroup.propertiesSchema.map((field) => {
            return {
                key: field.name,
                name: field.title
            };
        });
    } else {
        filters.unshift({
            name: 'name',
            title: 'Name',
            type: 'string',
            config: {}
        });

        sortableFields = [{ key: 'name', name: 'Name' }];
    }

    const selectedSourceGroupItems = useEntityCollection({
        items: selectedSourceGroup ? selectedSourceGroup.aois.items : undefined,
        selectionManager: props.aoiModule.mapModule.selectionManager,
        loadingState: selectedSourceGroup?.loadingStatus,
        filtering: {
            filters: filters
        },
        sortableFields: sortableFields,
        queryParams: selectedSourceGroup?.queryParams
    });

    const supportedFileTypes =
        aoiFormats &&
        aoiFormats.reduce((fileTypes, parser) => {
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
    const moduleState = useAoiModule(aoiModuleId);

    return useMapAoiImporterBase({
        aoiModule: moduleState,
        ...props
    });
};
