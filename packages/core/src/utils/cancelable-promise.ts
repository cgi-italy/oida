/**
 * Inspired by https://github.com/alkemics/CancelablePromise/blob/master/src/CancelablePromise.js
 * Added cancel callback support
 */
declare global {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Promise<T> {
        isCancelable?: boolean;
        isCanceled?: boolean;
        cancel?(): void;
    }
}

type CancelablePromiseOptions = {
    isCanceled?: boolean;
    onCancel?: () => void;
};

const wrapCallback = <TResult>(
    callback: ((value: any) => TResult | PromiseLike<TResult>) | undefined | null,
    options: CancelablePromiseOptions,
    shouldThrowIfNoCallback?: boolean
) => {
    return (arg) => {
        if (!options.isCanceled) {
            if (callback) {
                const result = callback(arg);
                if (result instanceof Promise) {
                    options.onCancel = result.cancel;
                } else {
                    options.onCancel = undefined;
                }
                return result;
            } else if (shouldThrowIfNoCallback) {
                throw arg;
            }
        }
    };
};

const cancelableThen = function <TResult1, TResult2>(
    this: Promise<TResult1>,
    options: CancelablePromiseOptions,
    onfulfilled?: ((value: TResult1) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
) {
    return cancelable(this.then(wrapCallback(onfulfilled, options), wrapCallback(onrejected, options, true)), options);
};

const cancelableCatch = function <TResult1, TResult2>(
    this: Promise<TResult1>,
    options: CancelablePromiseOptions,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
) {
    return cancelable(this.catch(wrapCallback(onrejected, options)), options);
};

const cancelableFinally = function <TResult1>(
    this: Promise<TResult1>,
    options: CancelablePromiseOptions,
    onfinally?: (() => void) | undefined | null
) {
    return cancelable(this.finally(onfinally), options);
};

const cancelable = <TResult1>(promise: Promise<TResult1>, options: CancelablePromiseOptions = { isCanceled: false }): Promise<TResult1> => {
    return {
        isCancelable: true,
        then: cancelableThen.bind(promise, options),
        catch: cancelableCatch.bind(promise, options),
        finally: cancelableFinally.bind(promise, options),
        cancel: () => {
            options.isCanceled = true;
            if (options.onCancel) {
                options.onCancel();
            }
        },
        get isCanceled() {
            return options.isCanceled;
        }
    } as Promise<TResult1>;
};

export const CancelablePromise = <T>(promise: Promise<T>, onCancel?: () => void) => {
    return cancelable(promise, {
        onCancel: onCancel
    });
};
