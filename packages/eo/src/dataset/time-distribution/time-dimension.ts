import { types } from 'mobx-state-tree';

export const TimeDistributionItem = types.model('TimeInterval', {
    start: types.Date,
    end: types.maybe(types.Date),
    data: types.frozen()
}).views((self) => ({
    isRange: () => {
        return !!self.end;
    },
    isoString: () => {
        let itemString = `${self.start.toISOString()}`;
        return (self.end) ? `${itemString}/${self.end.toISOString()}` : itemString;
    }
}));

export const TimeDistribution = types.model('TimeDistribution', {
    items: types.array(TimeDistributionItem)
}).volatile((self) => ({
    cachedIntervals: null
}))
.actions((self) => ({
    setItems: (items) => {
        self.items = items;
    }
}));

export const TimeDimension = types.model('TimeDimension', {
    range: types.frozen(),
    levels: types.array(types.model({
        durationStep: types.number,
        distribution: TimeDistribution
    }))
});
