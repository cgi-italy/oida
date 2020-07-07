import { types, Instance } from 'mobx-state-tree';

const TimeDistributionItemDecl = types.model('TimeInterval', {
    start: types.Date,
    end: types.maybe(types.Date),
    data: types.maybe(types.frozen())
}).views((self) => ({
    isRange: () => {
        return !!self.end && (self.start.getTime() !== self.end.getTime());
    },
    isoString: () => {
        let itemString = `${self.start.toISOString()}`;
        return (self.end) ? `${itemString}/${self.end.toISOString()}` : itemString;
    }
}));

type TimeDistributionItemType = typeof TimeDistributionItemDecl;
export interface TimeDistributionItemInterface extends TimeDistributionItemType {}
export const TimeDistributionItem: TimeDistributionItemInterface = TimeDistributionItemDecl;
export interface ITimeDistributionItem extends Instance<TimeDistributionItemInterface> {}


const TimeDistributionDecl = types.model('TimeDistribution', {
    items: types.array(TimeDistributionItem)
}).volatile((self) => ({
    cachedIntervals: null
}))
.actions((self) => ({
    setItems: (items) => {
        self.items = items;
    }
}));

type TimeDistributionType = typeof TimeDistributionDecl;
export interface TimeDistributionInterface extends TimeDistributionType {}
export const TimeDistribution: TimeDistributionInterface = TimeDistributionDecl;
export interface ITimeDistribution extends Instance<TimeDistributionInterface> {}

const TimeDimensionDecl = types.model('TimeDimension', {
    range: types.frozen(),
    levels: types.array(types.model({
        durationStep: types.number,
        distribution: TimeDistribution
    }))
});

type TimeDimensionType = typeof TimeDimensionDecl;
export interface TimeDimensionInterface extends TimeDimensionType {}
export const TimeDimension: TimeDimensionInterface = TimeDimensionDecl;
export interface ITimeDimension extends Instance<TimeDimensionInterface> {}
