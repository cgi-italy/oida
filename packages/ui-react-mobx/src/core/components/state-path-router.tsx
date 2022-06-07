import { reaction } from 'mobx';
import React, { useEffect, useRef } from 'react';
import { PathRouteProps, Route, Routes, useMatch, useNavigate, useResolvedPath, useLocation } from 'react-router-dom';

type StatePathRouterDefaultRouteProps = {
    defaultRoute?: string | (() => string | undefined) | (() => Promise<string | undefined>);
    routePathStateSelector: () => string | undefined;
    updateStateFromRoutePath: (routePath: string | undefined) => void;
};

const StatePathRouterDefaultRoute = (props: StatePathRouterDefaultRouteProps) => {
    const navigate = useNavigate();

    const location = useLocation();

    const replaceUrlPathName = (pathName) => {
        navigate(
            {
                pathname: pathName,
                search: window.location.search
            },
            {
                replace: true
            }
        );
    };

    useEffect(() => {
        let isMounted = true;

        if (/\/$/.test(window.location.pathname)) {
            // by convention if there is a trailing slash at the end of the url
            // the state will be reset
            props.updateStateFromRoutePath(undefined);
        } else {
            // otherwise the url param will be filled according to the current state
            const stateRoute = props.routePathStateSelector();
            if (stateRoute) {
                replaceUrlPathName(stateRoute);
            } else if (props.defaultRoute) {
                // no route param from the state. redirect to default route
                if (typeof props.defaultRoute === 'string') {
                    replaceUrlPathName(props.defaultRoute);
                } else {
                    const defaultRoute = props.defaultRoute();
                    if (defaultRoute) {
                        if (typeof defaultRoute === 'string') {
                            replaceUrlPathName(defaultRoute);
                        } else {
                            defaultRoute.then((path) => {
                                if (path && isMounted) {
                                    replaceUrlPathName(path);
                                }
                            });
                        }
                    }
                }
            } else {
                // add a training slash so that back navigation will work properly
                replaceUrlPathName('./');
            }
        }

        return () => {
            isMounted = false;
        };
    }, [location.pathname]);

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
                if (!ignoreNextStateUpdate.current) {
                    navigate({
                        pathname: path || './',
                        search: window.location.search
                    });
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
    /**
     * A function to update the state based on the current route parameter
     */
    updateStateFromRoutePath: (routePath: string | undefined) => void;
    /**
     * A function to extract the current router parameter from the application observable state
     */
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
    /**
     * The element to render when no route parameter is specified (index)
     * If defined the defaultRoute property is ignored
     */
    indexRouteElement?: React.ReactNode;
    /**
     * When specified will automatically redirect to the default route when the index page is accessed
     * This parameter is ignored if an indexRouteElement is specified
     */
    defaultRoute?: string | (() => string) | (() => Promise<string>);
    additionalRoutes?: PathRouteProps[];
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
                        <React.Fragment>
                            <StatePathRouterDefaultRoute
                                routePathStateSelector={props.routePathStateSelector}
                                updateStateFromRoutePath={props.updateStateFromRoutePath}
                                defaultRoute={props.indexRouteElement ? undefined : props.defaultRoute}
                            />
                            {props.indexRouteElement}
                        </React.Fragment>
                    }
                />
                <Route path={`:${props.pathParamName}/*`} element={props.innerRouteElement} />
                {additionalRoutes}
            </Route>
        </Routes>
    );
};
