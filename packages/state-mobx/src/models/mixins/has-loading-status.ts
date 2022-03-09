import { makeObservable, observable, action } from 'mobx';

import { LoadingState } from '@oidajs/core';

export type LoadingStatusValue = {
    value?: LoadingState;
    message?: string;
    percentage?: number;
};

export type LoadingStatusProps = {
    loadingStatus?: LoadingStatusValue;
};

export class LoadingStatus {
    @observable value: LoadingState;
    @observable message: string;
    @observable percentage: number;

    constructor(props?: LoadingStatusProps) {
        const { value, message, percentage } = props?.loadingStatus
            ? props.loadingStatus
            : {
                  value: undefined,
                  message: undefined,
                  percentage: undefined
              };
        this.value = value !== undefined ? value : LoadingState.Init;
        this.message = message || '';
        this.percentage = percentage || 0;

        makeObservable(this);
    }

    @action
    setValue(value: LoadingState) {
        this.value = value;
    }

    @action
    update(props: LoadingStatusValue) {
        if (props.percentage !== undefined) {
            this.percentage = props.percentage;
        }
        if (props.message !== undefined) {
            this.message = props.message;
        }
        if (props.value !== undefined) {
            this.value = props.value;
        }
    }
}

export interface HasLoadingStatus {
    loadingStatus: LoadingStatus;
}
