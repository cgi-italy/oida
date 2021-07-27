import React from 'react';

import { Empty } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { LoadingState } from '@oida/core';

export type AnalysisLoadingStateMessageProps = {
    loadingState: LoadingState,
    initMessage?: string;
    errorMessage?: string;
};

export const AnalysisLoadingStateMessage = ({loadingState, initMessage, errorMessage}: AnalysisLoadingStateMessageProps) => {

    return (
        <React.Fragment>
            {(loadingState === LoadingState.Init) &&
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={initMessage || 'Specify an area and a range to retrieve data'}
                />
            }
            {(loadingState === LoadingState.Loading) &&
                <Empty
                    image={<LoadingOutlined style={{fontSize: '32px'}}/>}
                    description='Retrieving data...'
                />
            }
            {(loadingState === LoadingState.Error) &&
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={errorMessage || 'Error retrieving data'}
                />
            }
        </React.Fragment>
    );
};
