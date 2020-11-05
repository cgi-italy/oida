import React from 'react';

import { Dropdown, Menu, Button } from 'antd';

import { CloseOutlined, ExportOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons';

import { ComboAnalysis, DatasetAnalysis } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

export type AnalysisSeriesActions = {
    combinedAnalysis: ComboAnalysis;
    analysis: DatasetAnalysis<any>;
    idx: number;
    availableTargets: Array<ComboAnalysis>;
};

export const AnalysisSeriesActions = (props: AnalysisSeriesActions) => {

    const numAnalyses = useSelector(() => props.combinedAnalysis.analyses.length);

    const onSeriesAction = (action) => {
        if (action === 'remove') {
            props.combinedAnalysis.removeAnalysis(props.analysis);
        } else if (action === 'undock') {
            props.combinedAnalysis.moveAnalysis(props.analysis);
        } else if (action === 'clone') {
            let series = props.analysis;
            props.combinedAnalysis.addAnalysis(series.clone(), props.idx + 1);
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
                        {numAnalyses > 1 &&
                            <Menu.Item key='remove' icon={<CloseOutlined />}>
                                Remove series
                        </Menu.Item>
                        }{(numAnalyses > 1 || props.availableTargets.length) &&
                            <Menu.SubMenu title='Move series to...' icon={<ExportOutlined />}>
                                {numAnalyses > 1 &&
                                    <Menu.Item key='undock'>
                                        Empty chart
                                </Menu.Item>
                                }
                                {numAnalyses > 1 && props.availableTargets.length && <Menu.Divider />}
                                {
                                    props.availableTargets.map((target) => {
                                        return <Menu.Item key={target.id} onClick={() => {
                                            props.combinedAnalysis.moveAnalysis(props.analysis, target);
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
