import { wrapInCancelablePromise, CancelablePromise } from '@oida/core';

import { IDatasetExplorerView } from '../datasets-explorer';
import { TimeSearchDirection } from '../dataset/time-distribution/dataset-time-distribution-provider';


export const getNearestDatasetProduct = function(
    dt: Date, direction: TimeSearchDirection, datasetViews: IDatasetExplorerView[]
) : CancelablePromise<Date | undefined> {

    let timeRequests = datasetViews.map((view) => {
        let timeProvider = view.timeDistributionViz?.config.provider;
        if (timeProvider) {
            return timeProvider.getNearestItem(
                dt,
                direction
            );
        } else {
            return wrapInCancelablePromise(Promise.resolve(undefined));
        }
    });

    return wrapInCancelablePromise(
        Promise.all(timeRequests).then((items) => {
            let targetDate: Date | undefined;
            if (direction === TimeSearchDirection.Forward) {
                items.forEach(item => {
                    if (item && (!targetDate || item.start < targetDate)) {
                        targetDate = item.start as Date;
                    }
                });

            } else {
                items.forEach(item => {
                    if (item && (!targetDate || item.start > targetDate)) {
                        targetDate = item.start as Date;
                    }
                });
            }
            if (targetDate) {
                return targetDate;
            } else {
                let timeRequests = datasetViews.map((view) => {
                    let timeProvider = view.timeDistributionViz?.config.provider;
                    if (timeProvider) {
                        return timeProvider.getTimeExtent();
                    } else {
                        return wrapInCancelablePromise(Promise.resolve(undefined));
                    }
                });
                return wrapInCancelablePromise(
                    Promise.all(timeRequests).then((items) => {
                        timeRequests = [];
                        if (direction === TimeSearchDirection.Forward) {
                            items.forEach(item => {
                                if (item && (!targetDate || item.end > targetDate)) {
                                    targetDate = item.end as Date;
                                }
                            });
                        } else {
                            items.forEach(item => {
                                if (item && (!targetDate || item.start < targetDate)) {
                                    targetDate = item.start as Date;
                                }
                            });
                        }
                        return targetDate;
                    })
                );
            }
        })
    );
};
