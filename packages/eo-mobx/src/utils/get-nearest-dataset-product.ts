import { DatasetExplorerItem } from '../dataset-explorer';
import { TimeSearchDirection } from '../common';

export const getNearestDatasetProduct = function (
    dt: Date,
    direction: TimeSearchDirection,
    datasetViews: DatasetExplorerItem[]
): Promise<Date | undefined> {
    const timeRequests = datasetViews.map((view) => {
        const timeDistribution = view.timeDistributionViz;
        if (timeDistribution) {
            return timeDistribution.config.provider.getNearestItem(dt, direction);
        } else {
            return Promise.resolve(undefined);
        }
    });

    return Promise.all(timeRequests).then((items) => {
        let targetDate: Date | undefined;
        if (direction === TimeSearchDirection.Forward) {
            items.forEach((item) => {
                if (item && (!targetDate || item.start < targetDate)) {
                    targetDate = item.start as Date;
                }
            });
        } else {
            items.forEach((item) => {
                if (item && (!targetDate || item.start > targetDate)) {
                    targetDate = item.start as Date;
                }
            });
        }
        if (targetDate) {
            return targetDate;
        } else {
            let timeRequests = datasetViews.map((view) => {
                const timeDistribution = view.timeDistributionViz;
                if (timeDistribution) {
                    return timeDistribution.config.provider.getTimeExtent();
                } else {
                    return Promise.resolve(undefined);
                }
            });
            return Promise.all(timeRequests).then((items) => {
                timeRequests = [];
                if (direction === TimeSearchDirection.Forward) {
                    items.forEach((item) => {
                        if (item && (!targetDate || item.end > targetDate)) {
                            targetDate = item.end as Date;
                        }
                    });
                } else {
                    items.forEach((item) => {
                        if (item && (!targetDate || item.start < targetDate)) {
                            targetDate = item.start as Date;
                        }
                    });
                }
                return targetDate;
            });
        }
    });
};
