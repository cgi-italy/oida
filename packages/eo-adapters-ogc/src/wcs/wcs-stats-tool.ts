import {
    DatasetAreaValuesConfig,
    DatasetTimeDistributionProvider,
    DatasetToolConfig,
    NumericVariable,
    DATASET_AREA_VALUES_PROCESSING
} from '@oidajs/eo-mobx';
import { createWcsStatsProvider, WcsStatsProviderConfig } from './wcs-stats-provider';

/**
 * {@link getWcsStatsToolConfig} input properties
 */
export type WcsStatsAnalysisConfig = {
    providerConfig: Omit<WcsStatsProviderConfig, 'bands'>;
    /** Dataset bands configuration */
    bands: NumericVariable[];
    /** Dataset time distribution provider. If available the tool will be configured with a time dimension */
    timeDistributionProvider?: DatasetTimeDistributionProvider;
};

/**
 * A function that given the information of a dataset exposed as a WCS (2.0) coverage,
 * generates a corresponding {@link DatasetStatsAnalysis} tool configuration.
 * When invoked The tool will use a GetCoverage request to retrieve the dataset raw data in GeoTiff format
 * over a BBOX, and will compute some statistics.
 *
 * @param props The input properties
 * @return The tool configuration object to be included in the {@link DatasetConfig} tools array
 */
export const getWcsStatsToolConfig = (props: WcsStatsAnalysisConfig) => {
    const provider = createWcsStatsProvider({
        ...props.providerConfig,
        bands: props.bands
    });

    const statsToolConfig: DatasetAreaValuesConfig = {
        variables: props.bands,
        supportedData: {
            stats: true,
            image: false,
            gridValues: true
        },
        supportedGeometries: [
            {
                type: 'BBox'
            }
        ],
        dimensions: props.timeDistributionProvider
            ? [
                  {
                      id: 'time',
                      name: 'Time',
                      domain: () => {
                          return props.timeDistributionProvider!.getTimeExtent().then((extent) => {
                              return {
                                  min: extent?.start || new Date(0),
                                  max: extent?.end || new Date()
                              };
                          });
                      }
                  }
              ]
            : [],
        provider: provider
    };

    return {
        type: DATASET_AREA_VALUES_PROCESSING,
        name: 'Area statistics',
        config: statsToolConfig
    } as DatasetToolConfig<typeof DATASET_AREA_VALUES_PROCESSING>;
};
