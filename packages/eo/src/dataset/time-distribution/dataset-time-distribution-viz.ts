import { autorun } from 'mobx';
import { types, Instance, addDisposer } from 'mobx-state-tree';
import debounce from 'lodash/debounce';

import { needsConfig } from '@oida/state-mst';

import { DatasetViz } from '../dataset-viz';
import { TimeDistribution } from './time-dimension';
import { DatasetTimeDistributionConfig } from './dataset-time-distribution-config';


const timeDistributionUpdater = (timeDistributionViz: IDatasetTimeDistributionViz, options: any = {}) => {

    let debounceSet = debounce((searchParams, filters) => {
        timeDistributionViz.timeDistribution.setItems([{
            start: searchParams.start,
            end: searchParams.end,
            data: {
                loading: true
            }
        }]);

        let stepDuration = searchParams.resolution ||
            Math.round((searchParams.end.getTime() - searchParams.start.getTime()) / (4 * 1000 * 3600)) * 1000 * 60;

        timeDistributionViz.config.provider.getTimeDistribution(searchParams, filters, stepDuration).then((items) => {
            timeDistributionViz.timeDistribution.setItems(items);
        }).catch((e) => {

        });

    }, options.debounceTimeout || 1000);

    let disposer = autorun(() => {
        let searchParams = {...timeDistributionViz.searchParams};
        let filters = timeDistributionViz.dataset.searchParams.data.filters;
        debounceSet(searchParams, filters);
    });

    return disposer;
};

export const DatasetTimeDistributionViz = DatasetViz.addModel(
    types.compose(
        'DatasetTimeDistributionViz',
        types.model({
            timeDistribution: types.optional(TimeDistribution, {}),
            searchParams: types.optional(types.model({
                start: types.optional(types.Date, new Date()),
                end: types.optional(types.Date, new Date()),
                resolution: types.maybe(types.number)
            }), {})
        }),
        needsConfig<DatasetTimeDistributionConfig>()
    ).actions((self) => (
        {
            setSearchParams: (params) => {
                self.searchParams = params;
            },
            afterAttach: () => {
                const timeDistributionUpdaterDisposer = timeDistributionUpdater(self as IDatasetTimeDistributionViz);
                addDisposer(self, () => {
                    timeDistributionUpdaterDisposer();
                });
            }
        }
    ))
);

export type IDatasetTimeDistributionViz = Instance<typeof DatasetTimeDistributionViz>;
