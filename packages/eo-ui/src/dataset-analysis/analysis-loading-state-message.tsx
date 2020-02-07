import React from 'react';

import { Empty, Icon } from 'antd';

import { LoadingState } from '@oida/core';

export type AnalysisLoadingStateMessageProps = {
    loadingState: LoadingState,
    initMessage?: string;
};

export const AnalysisLoadingStateMessage = ({loadingState, initMessage}: AnalysisLoadingStateMessageProps) => {

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
                    image={<Icon type='loading' style={{fontSize: '32px'}}/>}
                    description='Retrieving data...'
                />
            }
            {(loadingState === LoadingState.Error) &&
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description='No data found'
                />
            }
        </React.Fragment>
    );
};
