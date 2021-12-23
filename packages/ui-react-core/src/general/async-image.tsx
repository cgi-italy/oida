import React, { useEffect, useRef, useState } from 'react';

import { LoadingState } from '@oidajs/core';

/**
 * {@Link AsyncImage} component properties
 */
export type AsyncImageProps = {
    /**
     * The image src. It could be a string (url or datauri) or a promise returning the image src string
     */
    imageUrl: string | Promise<string>;
    /**
     * Content to be displayed while the image is loading
     */
    loadingContent?: React.ReactNode;
    /**
     * Content to be displayed when the image fails to load
     */
    errorContent?: React.ReactNode;
    /**
     * By default the image is lazy loaded when it becomes visible on the screen.
     * Set this to true to force image load immediatly after creation
     */
    eager?: boolean;
};

/**
 * A React component that wrap a standard html image element and displays a loading placeholder
 * while the image is loading and an error placeholder when the image loading fails
 * @param props the component properties
 */
export const AsyncImage = (props: AsyncImageProps) => {
    const [imageUrl, setImageUrl] = useState<string>();
    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.Init);

    const loadingIndicatorTimeout = useRef<any>();

    const cancelLoadingIndicator = () => {
        clearTimeout(loadingIndicatorTimeout.current);
    };

    useEffect(() => {
        let canUpdateOnPromiseResolve = true;

        // to prevent flickering avoid showing a loading indicator when image resolve immediatly (e.g cached or datauri)
        const showLoadingIndicator = () => {
            clearTimeout(loadingIndicatorTimeout.current);
            loadingIndicatorTimeout.current = setTimeout(() => {
                if (canUpdateOnPromiseResolve) {
                    setLoadingState(LoadingState.Loading);
                }
            }, 0);
        };

        if (typeof props.imageUrl === 'string') {
            if (props.imageUrl !== imageUrl) {
                showLoadingIndicator();
                setImageUrl(props.imageUrl);
            } else {
                cancelLoadingIndicator();
                setLoadingState(LoadingState.Success);
            }
        } else {
            showLoadingIndicator();
            props.imageUrl
                .then((url) => {
                    if (canUpdateOnPromiseResolve) {
                        if (url !== imageUrl) {
                            showLoadingIndicator();
                            setImageUrl(url);
                        } else {
                            cancelLoadingIndicator();
                            setLoadingState(LoadingState.Success);
                        }
                    }
                })
                .catch(() => {
                    if (canUpdateOnPromiseResolve) {
                        cancelLoadingIndicator();
                        setLoadingState(LoadingState.Error);
                    }
                });
        }

        return () => {
            canUpdateOnPromiseResolve = false;
        };
    }, [props.imageUrl]);

    return (
        <React.Fragment>
            {imageUrl && (
                <img
                    loading={props.eager ? 'eager' : 'lazy'}
                    src={imageUrl}
                    // in order for lazy loading to work the image cannot be hidden. We set its size to 0 instead
                    style={loadingState !== LoadingState.Success ? { height: 0, width: 0 } : undefined}
                    onLoad={() => {
                        cancelLoadingIndicator();
                        setLoadingState(LoadingState.Success);
                    }}
                    onError={() => {
                        cancelLoadingIndicator();
                        setLoadingState(LoadingState.Error);
                    }}
                />
            )}
            {loadingState === LoadingState.Loading && props.loadingContent}
            {loadingState === LoadingState.Error && props.errorContent}
        </React.Fragment>
    );
};
