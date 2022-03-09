import { DatasetExplorerItem } from '../dataset-explorer';

/**
 * Get the overall time extent of a set of datasets explorer items.
 * Only inout datasets with a time distribution provider will be considered in the computation
 * @param datasetViews the dataset list
 * @returns the time extent covered by the input datasets
 */
export const getDatasetsTimeExtent = function (
    datasetViews: DatasetExplorerItem[]
): Promise<{ start: Date | undefined; end: Date | undefined }> {
    const timeRequests = datasetViews.map((view) => {
        const timeDistribution = view.timeDistributionViz;
        if (timeDistribution) {
            return timeDistribution.config.provider.getTimeExtent(view.timeDistributionViz?.filters);
        } else {
            return Promise.resolve(undefined);
        }
    });

    return Promise.all(timeRequests).then((items) => {
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        items.forEach((item) => {
            if (item) {
                if (!startDate) {
                    startDate = item.start;
                } else {
                    startDate = new Date(Math.min(startDate.getTime(), item.start.getTime()));
                }
                if (!endDate) {
                    endDate = item.end;
                } else {
                    endDate = new Date(Math.max(endDate.getTime(), item.end.getTime()));
                }
            }
        });

        return {
            start: startDate,
            end: endDate
        };
    });
};
