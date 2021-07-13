import React from 'react';

import { Dropdown, Menu, Button, Space, Tooltip } from 'antd';

import { MinusOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';

import { ComboAnalysis, DatasetAnalysis } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

export type AnalysisDatasetActions = {
    combinedAnalysis: ComboAnalysis;
    analysis: DatasetAnalysis<any>;
    idx: number;
    availableTargets: Array<ComboAnalysis>;
    disableMove?: boolean;
};

export const AnalysisSeriesActions = (props: AnalysisDatasetActions) => {

    const numAnalyses = useSelector(() => props.combinedAnalysis.analyses.length);

    const exportMenu = (
        <Menu>
            <Menu.ItemGroup title='Move to...'>
                <Menu.Item key='undock' onClick={() => {
                    props.combinedAnalysis.moveAnalysis(props.analysis);
                }}>
                        New widget
                </Menu.Item>
                {props.availableTargets.length && <Menu.Divider />}
                {
                    props.availableTargets.map((target) => {
                        return <Menu.Item key={target.id} onClick={() => {
                            props.combinedAnalysis.moveAnalysis(props.analysis, target);
                        }}>
                            {target.name}
                        </Menu.Item>;
                    })
                }
            </Menu.ItemGroup>
        </Menu>
    );

    return (
        <Space className='analysis-actions'>
            <Tooltip title='Add series'>
                <Button
                    type='primary'
                    shape='circle'
                    size='small'
                    onClick={() => {
                        props.combinedAnalysis.addAnalysis(props.analysis.clone(), props.idx + 1);
                    }}
                >
                    <PlusOutlined />
                </Button>
            </Tooltip>
            {numAnalyses > 1 &&
                <Tooltip title='Remove series'>
                    <Button
                        type='primary'
                        shape='circle'
                        size='small'
                        onClick={() => {
                            props.combinedAnalysis.removeAnalysis(props.analysis);
                        }}
                    >
                        <MinusOutlined />
                    </Button>
                </Tooltip>
            }
            {numAnalyses > 1 && !props.disableMove &&
                <Tooltip title='Move series'>
                    <Dropdown trigger={['click']} overlay={exportMenu}>
                        <Button
                            type='primary'
                            shape='circle'
                            size='small'
                        >
                            <ExportOutlined />
                        </Button>
                    </Dropdown>
                </Tooltip>
            }
        </Space>
    );
};
