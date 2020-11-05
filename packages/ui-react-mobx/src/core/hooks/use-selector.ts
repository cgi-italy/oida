import { useEffect, useState, useMemo } from 'react';
import { reaction } from 'mobx';

export const useSelector = <T>(selector: () => T, deps?: React.DependencyList) => {

    const initialState = useMemo(() => selector(), []);

    const [data, setData] = useState<T>(initialState);

    useEffect(() => {
        const reactionDisposer = reaction(selector, (data) => {
            setData(data);
        }, {
            fireImmediately: true
        });

        return reactionDisposer;
    }, deps || []);

    return data;
};

