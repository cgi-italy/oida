import { AsyncDataFetcher } from '../src/models/mixins/async-data-fetcher';

describe('Async data fetcher', () => {

    it('Should cancel pending requests', (done) => {

        const dataFetcher = new AsyncDataFetcher({
            dataFetcher: () => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve('test');
                    }, 1000);
                });
            }
        });

        const firstThenCallback = jest.fn();
        const secondThenCallback = jest.fn();

        const firstRequest = dataFetcher.fetchData({}).then((data) => {
            firstThenCallback(data);
        });

        let secondRequest;
        setTimeout(() => {
            secondRequest = dataFetcher.fetchData({}).then((data) => {
                secondThenCallback(data);

                expect(firstThenCallback).toBeCalledTimes(0);
                expect(secondThenCallback).toBeCalledWith('test');

                expect(firstRequest.isCanceled).toBeTruthy();
                expect(secondRequest.isCanceled).toBeFalsy();

                done();
            });
        }, 100);

    });

    it('Should debounce requests', (done) => {

        const dataFetcher = new AsyncDataFetcher({
            dataFetcher: () => new Promise((resolve, reject) => {
                setTimeout(() => resolve('test'), 0);
            }),
            debounceInterval: 200
        });

        const firstThenCallback = jest.fn();
        const secondThenCallback = jest.fn();

        dataFetcher.fetchData({}).then(firstThenCallback);

        setTimeout(() => {
            dataFetcher.fetchData({}).then((data) => {
                secondThenCallback(data);
                expect(firstThenCallback).toBeCalledTimes(0);
                expect(secondThenCallback).toBeCalledWith('test');
                done();
            });
        }, 100);
    });

});
