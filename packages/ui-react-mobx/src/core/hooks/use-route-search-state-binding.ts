import { useEffect, useRef } from 'react';
import { reaction, runInAction } from 'mobx';
import { useSearchParams, useResolvedPath } from 'react-router-dom';

export type RouteSearchStateBindingProps = {
    updateStateFromSearchParams: (searchParams: URLSearchParams) => void;
    searchParamsStateSelector: () => URLSearchParams;
};

export const useRouteSearchStateBinding = (props: RouteSearchStateBindingProps) => {
    const ignoreNextStateUpdate = useRef(false);
    const componentUnmounted = useRef(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const resolvedPath = useResolvedPath('.');

    useEffect(() => {
        return () => {
            componentUnmounted.current = true;
        };
    }, []);

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
            }
            initialUrlParams.set(key, value);
        });

        if (shouldReplaceUrl) {
            setSearchParams(initialUrlParams, {
                replace: true
            });
        }
    }, [props.searchParamsStateSelector, resolvedPath.pathname]);

    useEffect(() => {
        const stateTrackerDisposer = reaction(
            () => props.searchParamsStateSelector(),
            (stateParams) => {
                if (componentUnmounted.current) {
                    return;
                }
                if (!ignoreNextStateUpdate.current) {
                    let needsUrlUpdate = false;
                    const updatedSearchParams = new URLSearchParams(window.location.search);
                    stateParams.forEach((value, key) => {
                        if (value !== updatedSearchParams.get(key)) {
                            needsUrlUpdate = true;
                            updatedSearchParams.set(key, value);
                        }
                    });
                    if (needsUrlUpdate) {
                        setSearchParams(updatedSearchParams);
                    }
                } else {
                    ignoreNextStateUpdate.current = false;
                }
            }
        );

        return () => {
            stateTrackerDisposer();
        };
    }, [props.searchParamsStateSelector, resolvedPath.pathname]);

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
