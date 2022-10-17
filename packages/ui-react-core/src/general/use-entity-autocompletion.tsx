import { useState, useEffect } from 'react';

import { LoadingState } from '@oidajs/core';

/** Input params for the {@link useEntityAutoCompletion} hook */
export type UseEntityAutocompletionParams<T extends { id: ID_TYPE }, ID_TYPE extends number | string = number> = {
    /** A function that should return the an item metadata given its id  */
    getItem: (id: ID_TYPE) => Promise<T>;
    /** The search function. It should return an array of items given an input search string */
    searchItems: (searchInput: string) => Promise<T[]>;
    /**
     * An optional filtering function. It will be applied to the output of the search function
     * Useful to implement some client side filtering when the search api doesn't support all required filters
     */
    filteringCondition?: (item: T) => boolean;
    /**
     * The current selected item
     */
    value?: T | ID_TYPE;
};

/**
 * An hook to implement item selection with support for search and autocompletion
 * @param props The input parameters
 * @returns A map of items matching the latest search string, a function to update the list of items
 * given a search string and the search loading state
 */
export const useEntityAutoCompletion = <T extends { id: ID_TYPE }, ID_TYPE extends number | string = number>(
    props: UseEntityAutocompletionParams<T, ID_TYPE>
) => {
    const [options, setOptions] = useState(new Map<ID_TYPE, T>());

    const [loadingState, setLoadingState] = useState(LoadingState.Init);

    const updateOptions = (searchString: string) => {
        setLoadingState(LoadingState.Loading);
        props
            .searchItems(searchString)
            .then((response) => {
                setLoadingState(LoadingState.Success);
                let newOptionsItems = response;
                if (props.filteringCondition) {
                    newOptionsItems = newOptionsItems.filter(props.filteringCondition);
                }
                setOptions((currentOptions) => {
                    const newOptions = new Map(newOptionsItems.map((item) => [item.id, item]));
                    //ensure that the currently selected item is always amongst the options
                    let selectedItem: T | undefined;
                    if (props.value) {
                        if (typeof props.value === 'string' || typeof props.value === 'number') {
                            selectedItem = currentOptions.get(props.value);
                        } else {
                            selectedItem = props.value as T | undefined;
                        }
                    }
                    if (selectedItem && !newOptions.has(selectedItem.id)) {
                        newOptions.set(selectedItem.id, selectedItem);
                    }
                    return newOptions;
                });
            })
            .catch(() => {
                setLoadingState(LoadingState.Error);
                setOptions((currentOptions) => {
                    const newOptions = new Map<ID_TYPE, T>();
                    if (props.value) {
                        if (typeof props.value === 'string' || typeof props.value === 'number') {
                            const selectedItem = currentOptions.get(props.value);
                            if (selectedItem) {
                                newOptions.set(props.value, selectedItem);
                            }
                        } else {
                            newOptions.set(props.value.id, props.value as T);
                        }
                    }
                    return newOptions;
                });
            });
    };

    useEffect(() => {
        updateOptions('');
    }, []);

    useEffect(() => {
        const inputValue = props.value;
        if (inputValue) {
            if (typeof inputValue === 'number' || typeof inputValue === 'string') {
                if (!options.get(inputValue)) {
                    setLoadingState(LoadingState.Loading);
                    props
                        .getItem(inputValue)
                        .then((item) => {
                            setLoadingState(LoadingState.Success);
                            setOptions((currentOptions) => {
                                const newOptions = new Map(currentOptions);
                                newOptions.set(inputValue, item);
                                return newOptions;
                            });
                        })
                        .catch((error) => {
                            setLoadingState(LoadingState.Error);
                        });
                }
            } else {
                setOptions((currentOptions) => {
                    const newOptions = new Map(currentOptions);
                    newOptions.set(inputValue.id, inputValue as T);
                    return newOptions;
                });
            }
        }
    }, [props.value]);

    return [options, updateOptions, loadingState] as [Map<ID_TYPE, T>, (searchString: string) => void, LoadingState];
};
