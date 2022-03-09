export class SubscriptionTracker {
    private unsubscribeCbs_: Array<() => any> = [];

    public addSubscription(unsubscribeCb: () => any) {
        this.unsubscribeCbs_.push(unsubscribeCb);
    }

    public unsubscribe() {
        this.unsubscribeCbs_.forEach((unsubscribeCb) => {
            unsubscribeCb();
        });

        this.unsubscribeCbs_ = [];
    }
}
