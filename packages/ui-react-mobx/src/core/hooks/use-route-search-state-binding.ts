import React, { useEffect, useRef } from 'react';
import { reaction, runInAction } from 'mobx';
import { useSearchParams, useNavigate, UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export type RouteSearchStateBindingProps = {
    updateStateFromSearchParams: (searchParams: URLSearchParams) => void;
    searchParamsStateSelector: () => URLSearchParams;
};

export const useRouteSearchStateBinding = (props: RouteSearchStateBindingProps) => {
    const ignoreNextStateUpdate = useRef(false);
    const componentUnmounted = useRef(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { basename } = React.useContext(NavigationContext);

    useEffect(() => {
        return () => {
            componentUnmounted.current = true;
        };
    }, []);

    const getCurrentPathname = () => {
        // basename will be automatically added by the navigate function so we strip it from
        // the current window location pathname
        if (basename !== '/') {
            return window.location.pathname.replace(basename, '/');
        } else {
            return window.location.pathname;
        }
    };

    // this is executed once to initialize the missisng url params from state
    useEffect(() => {
        if (componentUnmounted.current) {
            return;
        }
        const currentStateParams = props.searchParamsStateSelector();
        const initialUrlParams = new URLSearchParams(window.location.search);
        let shouldReplaceUrl = false;
        currentStateParams.forEach((value, key) => {
            if (!initialUrlParams.has(key)) {
                shouldReplaceUrl = true;
                initialUrlParams.set(key, value);
            }
        });

        if (shouldReplaceUrl) {
            navigate(
                {
                    pathname: getCurrentPathname(),
                    search: initialUrlParams.toString()
                },
                {
                    replace: true
                }
            );
        }

        return () => {
            //remove the query params from the URL when unmounted
            const cleanedUrlParams = new URLSearchParams(window.location.search);
            currentStateParams.forEach((value, key) => {
                cleanedUrlParams.delete(key);
            });
            navigate(
                {
                    pathname: getCurrentPathname(),
                    search: cleanedUrlParams.toString()
                },
                {
                    replace: true
                }
            );
        };
    }, [props.searchParamsStateSelector]);

    useEffect(() => {
        let urlUpdateTimeout;
        const stateTrackerDisposer = reaction(
            () => props.searchParamsStateSelector(),
            (stateParams) => {
                if (componentUnmounted.current) {
                    return;
                }
                const shouldReplaceUrl = ignoreNextStateUpdate.current;
                let needsUrlUpdate = false;
                const updatedSearchParams = new URLSearchParams(window.location.search);
                stateParams.forEach((value, key) => {
                    if (value !== updatedSearchParams.get(key)) {
                        needsUrlUpdate = true;
                        updatedSearchParams.set(key, value);
                    }
                });
                if (needsUrlUpdate) {
                    if (urlUpdateTimeout) {
                        clearTimeout(urlUpdateTimeout);
                    }
                    urlUpdateTimeout = setTimeout(() => {
                        urlUpdateTimeout = undefined;
                        navigate(
                            {
                                pathname: getCurrentPathname(),
                                search: updatedSearchParams.toString()
                            },
                            {
                                replace: shouldReplaceUrl
                            }
                        );
                    }, 0);
                }
                ignoreNextStateUpdate.current = false;
            }
        );

        return () => {
            stateTrackerDisposer();
        };
    }, [props.searchParamsStateSelector]);

    useEffect(() => {
        if (componentUnmounted.current) {
            return;
        }
        const currentStateParams = props.searchParamsStateSelector();
        const currentUrlParams = new URLSearchParams(window.location.search);
        let needStateUpdate = false;

        currentStateParams.forEach((value, key) => {
            if (value !== currentUrlParams.get(key)) {
                needStateUpdate = true;
            }
        });

        if (needStateUpdate) {
            ignoreNextStateUpdate.current = true;
            runInAction(() => {
                props.updateStateFromSearchParams(searchParams);
            });
        }
    }, [searchParams]);
};
