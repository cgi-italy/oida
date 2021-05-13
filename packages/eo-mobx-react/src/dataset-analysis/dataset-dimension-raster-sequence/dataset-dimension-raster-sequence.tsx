import React, { useState } from 'react';
import { Form, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

import { DatasetDimensionRasterSequence, DIMENSION_RASTER_SEQUENCE_TYPE, DatasetDimensionRasterSequenceConfig } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

import { DatasetSelector } from '../dataset-selector';
import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetDimensionRasterSequenceFilters } from './dataset-dimension-raster-sequence-filters';
import { DatasetDimensionRasterSequenceChart } from './dataset-dimension-raster-sequence-chart';


export const DatasetDimensionRasterSequenceAnalysis = (props: DatasetAnalysisWidgetFactoryConfig) => {

    const [filtersVisible, setFiltersVisible] = useState(true);

    const getSequence = () => {
        if (!props.combinedAnalysis.analyses.length) {
            return null;
        }
        return props.combinedAnalysis.analyses[0] as DatasetDimensionRasterSequence;
    };

    const sequence = useSelector(() => {
        return getSequence();
    });

    let sequenceFilters = useSelector(() => {

        const sequence = getSequence();
        if (!sequence) {
            return null;
        }

        sequence.setAutoUpdate(false);

        const avaialbleDatasetItems = props.datasetExplorerItems.filter(item => {
            return item.dataset.config.tools?.find(tool => tool.type === DIMENSION_RASTER_SEQUENCE_TYPE);
        });

        return (
            <div className='analysis-parameters' key={sequence.id}>
                <Form layout='inline' size='small'>
                    <Form.Item label='Dataset'>
                        <DatasetSelector
                            value={sequence.dataset.id}
                            datasets={avaialbleDatasetItems.map(item => item.dataset.config)}
                            onChange={(value) => {
                                const aoi = sequence.aoi;
                                props.combinedAnalysis.removeAnalysis(sequence);
                                if (value) {
                                    let item = avaialbleDatasetItems.find(item => item.dataset.id === value);

                                    if (item) {
                                        const dimensionSequence = new DatasetDimensionRasterSequence({
                                            dataset: item.dataset,
                                            config: item.dataset.config!.tools!.find(
                                                tool => tool.type === DIMENSION_RASTER_SEQUENCE_TYPE
                                            )!.config as DatasetDimensionRasterSequenceConfig,
                                            autoUpdate: false,
                                            aoi: aoi,
                                            parent: item.mapViz
                                        });

                                        props.combinedAnalysis.addAnalysis(dimensionSequence);
                                    }
                                }
                            }}
                        />
                    </Form.Item>
                    <DatasetDimensionRasterSequenceFilters
                        sequence={sequence}
                    />

                </Form>
            </div>
        );
    }, [props.datasetExplorerItems]);

    const canRunQuery = useSelector(() => {
        const sequence = getSequence();
        return sequence?.canRunQuery;
    });

    return (
        <div className='dataset-dimension-raster-sequence dataset-chart'>
            {filtersVisible &&
                <div className='dataset-chart-form'>
                    <div className='dataset-chart-filters'>
                        {sequenceFilters}
                    </div>
                    <Button
                        className='dataset-chart-search-btn'
                        type='primary'
                        onClick={() => {
                            const sequence = getSequence();
                            sequence?.retrieveData();
                            setFiltersVisible(false);
                        }}
                        disabled={!canRunQuery}
                    >
                        Apply
                    </Button>
                </div>
            }
            {!filtersVisible &&
                <div className='dataset-chart-result'>
                    <Button
                        className='dataset-chart-modify-params-btn'
                        type='link'
                        icon={<LeftOutlined />}
                        onClick={() => {
                            const sequence = getSequence();
                            sequence?.visible.setValue(true);
                            props.combinedAnalysis.analyses[0].visible.setValue(true);
                            setFiltersVisible(true);
                        }}
                    >
                        Modify parameters
                    </Button>
                    {sequence &&
                        <DatasetDimensionRasterSequenceChart
                            sequence={sequence}
                        />
                    }
                </div>
            }
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(DIMENSION_RASTER_SEQUENCE_TYPE, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetDimensionRasterSequenceAnalysis {...config}/>;
});
