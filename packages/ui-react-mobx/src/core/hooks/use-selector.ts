import { useEffect, useState, useMemo } from 'react';
import { reaction } from 'mobx';

/**
 * An React hook to extract a set of properties from an observable mobx state.
 * The selector will be executed inside a mobx reaction so that each time the state properties accessed within the
 * selector are updated, the hook is executed again and the returned value updated
 *
 * @prop selector The selector function
 * @prop deps An optional list of dependencies that will force the hook to run again when change
 * @returns the data extracted by the selector function
 */
export const useSelector = <T>(selector: () => T, deps?: React.DependencyList) => {

    const initialState = useMemo(() => selector(), []);

    const [data, setData] = useState<T>(initialState);

    useEffect(() => {
        const reactionDisposer = reaction(selector, (data) => {
            if (typeof(data) === 'function') {
                // if the selector returns a callback we have to wrap the setData
                // within a function
                setData(() => data);
            } else {
                setData(data);
            }
        }, {
            fireImmediately: true
        });

        return reactionDisposer;
    }, deps || []);

    return data;
};

