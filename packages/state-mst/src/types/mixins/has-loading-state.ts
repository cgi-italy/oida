import { types } from 'mobx-state-tree';

import { LoadingState } from '@oida/core';

import { enumFromType } from '../mst';

export type LoadingStateProps = {
    state?: LoadingState,
    message?: string,
    percentage?: number
};

export const hasLoadingState = types.model({
    loadingState: types.optional(enumFromType<LoadingState>(LoadingState), LoadingState.Init),
    loadingMessage: types.maybe(types.string),
    loadingPercentage: types.maybe(types.number)
}).actions((self) => {
    return {
        setLoadingState: (loadingState: LoadingState) => {
            self.loadingState = loadingState;
        },
        setLoadingProps: (props: LoadingStateProps) => {
            if (props.percentage !== undefined) {
                self.loadingPercentage = props.percentage;
            }
            if (props.message !== undefined) {
                self.loadingMessage = props.message;
            }
            if (props.state !== undefined) {
                self.loadingState = props.state;
            }
        }
    };
});
