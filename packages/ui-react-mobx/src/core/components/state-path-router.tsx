import { reaction } from 'mobx';
import React, { useEffect, useRef } from 'react';
import { PathRouteProps, Route, Routes, useMatch, useNavigate, useResolvedPath, useParams } from 'react-router-dom';
import { useSelector } from '../hooks';

type StatePathRouterDefaultRouteProps = {
    defaultRoute?: string | (() => string | undefined) | (() => Promise<string | undefined>);
    routePathStateSelector: () => string | undefined;
    updateStateFromRoutePath: (routePath: string | undefined) => void;
};

const StatePathRouterDefaultRoute = (props: StatePathRouterDefaultRouteProps) => {
    const navigate = useNavigate();

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
        let updateStillValid = true;

        if (/\/$/.test(window.location.pathname)) {
            // by convention if there is a trailing slash at the end of the url
            // the state will be reset. We debounce the update to avoid updating the state during
            // transitions
            setTimeout(() => {
                if (updateStillValid) {
                    props.updateStateFromRoutePath(undefined);
                }
            }, 0);
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
                                if (path && updateStillValid) {
                                    replaceUrlPathName(path);
                                }
                            });
                        }
                    }
                }
            } else {
                // add a trailing slash so that back navigation will work properly
                replaceUrlPathName('./');
            }
        }

        return () => {
            updateStillValid = false;
        };
    }, [window.location.pathname]);

    return null;
};

type StatePathRouterRootProps = {
    updateStateFromRoutePath: (routePath: string | undefined) => void;
    routePathStateSelector: (forceDefault?: boolean) => string | undefined;
    pathParamName: string;
    parentRouteElement: React.ReactNode;
};

const StatePathRouterRoot = (props: StatePathRouterRootProps) => {
    const resolvedPath = useResolvedPath(`:${props.pathParamName}/*`);
    const match = useMatch(resolvedPath.pathname);

    const navigate = useNavigate();

    // check that the current path is different from the new one before updating the url
    // this is to avoid messing history navigation
    const getUrlUpdateFunction = (currentRouteMatch: string | undefined) => {
        return (statePath) => {
            if (currentRouteMatch !== statePath) {
                navigate({
                    pathname: statePath || './',
                    search: window.location.search
                });
            }
        };
    };

    const updateUrlForPath = useRef(getUrlUpdateFunction(match?.params[props.pathParamName]));
    useEffect(() => {
        updateUrlForPath.current = getUrlUpdateFunction(match?.params[props.pathParamName]);
        // rerun also on location changes in order for the navigate function to reflect
        // potentials changes to parent routes
    }, [match, window.location.pathname]);

    useEffect(() => {
        const stateTrackerDisposer = reaction(
            () => props.routePathStateSelector(),
            (path) => {
                updateUrlForPath.current(path);
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
            props.updateStateFromRoutePath(path);
        }
    }, [match]);

    return <React.Fragment>{props.parentRouteElement}</React.Fragment>;
};

type StatePathRouterInnerProps = {
    routePathStateSelector: (forceDefault?: boolean) => string | undefined;
    pathParamName: string;
    innerRouteElement: React.ReactNode;
};

const StatePathRouterInner = (props: StatePathRouterInnerProps) => {
    const stateRoute = useSelector(() => props.routePathStateSelector(), [props.routePathStateSelector]);
    const urlParam = useParams()[props.pathParamName];
    // during transitions the state and url param may be different.
    // to avoid any inconsistencies do not render the inner element
    if (stateRoute !== urlParam) {
        return null;
    } else {
        return <React.Fragment>{props.innerRouteElement}</React.Fragment>;
    }
};

/**
 * {@link StatePathRouter} component properties
 */
export type StatePathRouterProps = {
    /** The name to give to the state url parameter (key in the useParams() response) */
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
     */
    parentRouteElement: React.ReactNode;
    /**
     * The element used to render the inner route.
     * Current route parameter can be retrieved using useParams()[pathParamName] call
     */
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
    /**
     * An optional list of additional routes
     */
    additionalRoutes?: PathRouteProps[];
};

/**
 * A react component providing a two way binding between a piece of application state and a url path segment
 * @param props the component props
 * @returns
 */
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
                <Route
                    path={`:${props.pathParamName}/*`}
                    element={
                        <StatePathRouterInner
                            innerRouteElement={props.innerRouteElement}
                            pathParamName={props.pathParamName}
                            routePathStateSelector={props.routePathStateSelector}
                        />
                    }
                />
                {additionalRoutes}
            </Route>
        </Routes>
    );
};
