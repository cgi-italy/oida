import React from 'react';
import { v4 as uuid } from 'uuid';
import { getSnapshot } from 'mobx-state-tree';
import { useObserver } from 'mobx-react';
import { Dropdown, Menu, Button } from 'antd';

import { CloseOutlined, ExportOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons';

import { IComboAnalysis, IDatasetAnalysis } from '@oida/eo';

export type AnalysisSeriesActions = {
    combinedAnalysis: IComboAnalysis;
    analysis: IDatasetAnalysis;
    idx: number;
    availableTargets: Array<{id: string, name: string}>;
};

export const AnalysisSeriesActions = (props: AnalysisSeriesActions) => {

    const analyses = useObserver(() => props.combinedAnalysis.analyses);

    const onSeriesAction = (action) => {
        if (action === 'remove') {
            props.combinedAnalysis.removeAnalysis(props.analysis);
        } else if (action === 'undock') {
            props.combinedAnalysis.moveAnalysis(props.analysis);
        } else if (action === 'clone') {

            let series = props.analysis.datasetViz;

            props.combinedAnalysis.addAnalysis({
                id: uuid(),
                datasetViz: {
                    ...getSnapshot(series),
                    id: uuid(),
                    aoi: series.aoi
                }
            }, props.idx + 1);
        }
    };

    return (
        <div className='analysis-actions'>
            <Dropdown
                overlay={
                    <Menu onClick={(evt) => onSeriesAction(evt.key)}>
                        <Menu.Item key='clone' icon={<PlusOutlined />}>
                            Add series
                    </Menu.Item>
                        {analyses.length > 1 &&
                            <Menu.Item key='remove' icon={<CloseOutlined />}>
                                Remove series
                        </Menu.Item>
                        }{(analyses.length > 1 || props.availableTargets.length) &&
                            <Menu.SubMenu title='Move series to...' icon={<ExportOutlined />}>
                                {analyses.length > 1 &&
                                    <Menu.Item key='undock'>
                                        Empty chart
                                </Menu.Item>
                                }
                                {analyses.length > 1 && props.availableTargets.length && <Menu.Divider />}
                                {
                                    props.availableTargets.map((target) => {
                                        return <Menu.Item key={target.id} onClick={() => {
                                            props.combinedAnalysis.moveAnalysis(props.analysis, target.id);
                                        }}>
                                            {target.name}
                                        </Menu.Item>;
                                    })
                                }
                            </Menu.SubMenu>
                        }

                    </Menu>
                }
            >
                <Button
                    type='primary'
                    shape='circle'
                    size='small'
                >
                    <EllipsisOutlined />
                </Button>
            </Dropdown>
        </div>
    );
};
