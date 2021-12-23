import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

import { useSelector } from './use-selector';

type RoutePathStateBindingProps = {
    parentRoute: string;
    updateStateFromRoute: (routePath: string | undefined) => void;
    stateRouteSelector: () => string | undefined;
};

export const useRoutePathStateBinding = (props: RoutePathStateBindingProps) => {
    const history = useHistory();
    const location = useLocation<{ updateLocationFromState: boolean }>();

    const [updateMode, setUpdateMode] = useState<'replaceLocation' | 'pushLocation' | 'updateState' | undefined>(
        location.state?.updateLocationFromState ? 'replaceLocation' : 'updateState'
    );

    const routeMatchRegexp = new RegExp(`${props.parentRoute}/([^/\\\\]*)`);

    const selectedRoute = useSelector(props.stateRouteSelector);

    useEffect(() => {
        if (updateMode) {
            const routeMatches = window.location.pathname.match(routeMatchRegexp);
            const routeId = routeMatches ? routeMatches[1] : undefined;
            const selectedRoute = props.stateRouteSelector();
            if (updateMode === 'updateState') {
                if (routeId !== selectedRoute) {
                    props.updateStateFromRoute(routeId);
                }
            } else {
                if (routeId !== selectedRoute) {
                    let updatedPath: string;
                    if (routeMatchRegexp.test(window.location.pathname)) {
                        updatedPath = window.location.pathname.replace(routeMatchRegexp, `${props.parentRoute}/${selectedRoute || ''}`);
                    } else {
                        updatedPath = `${props.parentRoute}/${selectedRoute || ''}`;
                    }
                    if (updateMode === 'pushLocation') {
                        history.push(`${updatedPath}${window.location.search ? window.location.search : ''}`, {
                            updateLocationFromState: true
                        });
                    } else {
                        history.replace(`${updatedPath}${window.location.search ? window.location.search : ''}`, {
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
    }, [selectedRoute]);
};
