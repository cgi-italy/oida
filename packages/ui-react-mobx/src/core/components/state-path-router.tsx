import { reaction } from 'mobx';
import React, { useEffect, useRef } from 'react';
import { PathRouteProps, Route, Routes, useMatch, useNavigate, useResolvedPath } from 'react-router-dom';

type StatePathRouterDefaultRouteProps = {
    defaultRoute?: string | (() => string | undefined) | (() => Promise<string | undefined>);
    routePathStateSelector: () => string | undefined;
};

const StatePathRouterDefaultRoute = (props: StatePathRouterDefaultRouteProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const stateRoute = props.routePathStateSelector();
        if (stateRoute) {
            navigate(stateRoute, { replace: true });
        } else if (props.defaultRoute) {
            if (typeof props.defaultRoute === 'string') {
                navigate(props.defaultRoute, { replace: true });
            } else {
                const defaultRoute = props.defaultRoute();
                if (defaultRoute) {
                    if (typeof defaultRoute === 'string') {
                        navigate(defaultRoute, { replace: true });
                    } else {
                        defaultRoute.then((path) => {
                            if (path && isMounted) {
                                navigate(path, { replace: true });
                            }
                        });
                    }
                }
            }
        }

        return () => {
            isMounted = false;
        };
    }, []);

    return null;
};

type StatePathRouterRootProps = {
    updateStateFromRoutePath: (routePath: string | undefined) => void;
    routePathStateSelector: (forceDefault?: boolean) => string | undefined;
    pathParamName: string;
    parentRouteElement: React.ReactNode;
};

const StatePathRouterRoot = (props: StatePathRouterRootProps) => {
    const ignoreNextStateUpdate = useRef(false);
    const resolvedPath = useResolvedPath(`:${props.pathParamName}/*`);
    const match = useMatch(resolvedPath.pathname);

    const navigate = useNavigate();

    useEffect(() => {
        const stateTrackerDisposer = reaction(
            () => props.routePathStateSelector(),
            (path) => {
                if (!ignoreNextStateUpdate.current && path) {
                    navigate(path);
                } else {
                    ignoreNextStateUpdate.current = false;
                }
            }
        );
        return () => {
            stateTrackerDisposer();
        };
    }, [props.routePathStateSelector]);

    useEffect(() => {
        const path = match?.params[props.pathParamName];
        const currentStatePath = props.routePathStateSelector();
        if (path && path !== currentStatePath) {
            ignoreNextStateUpdate.current = true;
            props.updateStateFromRoutePath(path);
        }
    }, [match]);

    return <React.Fragment>{props.parentRouteElement}</React.Fragment>;
};

export type StatePathRouterProps = {
    pathParamName: string;
    updateStateFromRoutePath: (routePath: string | undefined) => void;
    routePathStateSelector: () => string | undefined;
    /**
     * The element used to render the parent route.
     * Make sure it contains an Outlet element where the innerRouteElement will be rendered
     **/
    parentRouteElement: React.ReactNode;
    /**
     * The element used to render the inner route.
     * Current route parameter can be retrieved using useParams(pathParamName) call
     **/
    innerRouteElement: React.ReactNode;
    additionalRoutes?: PathRouteProps[];
    defaultRoute?: string | (() => string) | (() => Promise<string>);
};

export const StatePathRouter = (props: StatePathRouterProps) => {
    const additionalRoutes = props.additionalRoutes?.map((routeProps) => {
        return <Route {...routeProps} />;
    });

    return (
        <Routes>
            <Route
                path='/'
                element={
                    <StatePathRouterRoot
                        updateStateFromRoutePath={props.updateStateFromRoutePath}
                        routePathStateSelector={props.routePathStateSelector}
                        parentRouteElement={props.parentRouteElement}
                        pathParamName={props.pathParamName}
                    />
                }
            >
                <Route
                    index
                    element={
                        <StatePathRouterDefaultRoute
                            routePathStateSelector={props.routePathStateSelector}
                            defaultRoute={props.defaultRoute}
                        />
                    }
                />
                <Route path={`:${props.pathParamName}/*`} element={props.innerRouteElement} />
                {additionalRoutes}
            </Route>
        </Routes>
    );
};
