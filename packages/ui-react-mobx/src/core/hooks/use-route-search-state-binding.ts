import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

import { useSelector } from './use-selector';

type RouteSearchStateBindingProps = {
    updateState: (queryString: string | undefined) => void;
    stateQueryStringSelector: () => string | undefined;
};

export const useRouteSearchStateBinding = (props: RouteSearchStateBindingProps) => {
    const history = useHistory();
    const location = useLocation<{ updateLocationFromState: boolean }>();

    const [updateMode, setUpdateMode] = useState<'replaceLocation' | 'pushLocation' | 'updateState' | undefined>(
        location.state?.updateLocationFromState ? 'replaceLocation' : 'updateState'
    );

    const stateQuery = useSelector(props.stateQueryStringSelector);

    useEffect(() => {
        if (updateMode) {
            const stateQuery = props.stateQueryStringSelector();
            if (updateMode === 'updateState') {
                props.updateState(window.location.search);
            } else {
                if (stateQuery !== window.location.search.substr(1)) {
                    if (updateMode === 'pushLocation') {
                        history.push(`${window.location.pathname}?${stateQuery}`, {
                            updateLocationFromState: true
                        });
                    } else {
                        history.replace(`${window.location.pathname}?${stateQuery}`, {
                            updateLocationFromState: true
                        });
                    }
                }
            }
            setUpdateMode(undefined);
        }
    }, [updateMode]);

    useEffect(() => {
        if (!updateMode) {
            setUpdateMode('updateState');
        }
    }, [location]);

    useEffect(() => {
        if (!updateMode) {
            setUpdateMode('pushLocation');
        }
    }, [stateQuery]);
};
