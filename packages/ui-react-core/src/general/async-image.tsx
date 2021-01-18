import React, { useEffect, useState } from 'react';

import { LoadingState } from '@oida/core';

export type AsyncImageProps = {
    imageUrl: string | Promise<string>;
    loadingContent?: React.ReactNode;
    errorContent?: React.ReactNode;
    onLoad?: (state: LoadingState) => void;
};

export const AsyncImage = (props: AsyncImageProps) => {

    const [imageUrl, setImageUrl] = useState<string>();
    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.Init);

    useEffect(() => {

        let canUpdateOnPromiseResolve = true;

        setLoadingState(LoadingState.Loading);
        if (typeof(props.imageUrl) === 'string') {
            setImageUrl(props.imageUrl);
        } else {
            props.imageUrl.then((url) => {
                if (canUpdateOnPromiseResolve) {
                    setImageUrl(url);
                }
            }).catch(() => {
                if (canUpdateOnPromiseResolve) {
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
            {imageUrl &&
                <img
                    src={imageUrl}
                    style={{display: loadingState !== LoadingState.Success ? 'none' : ''}}
                    onLoad={() => setLoadingState(LoadingState.Success)}
                    onError={() => setLoadingState(LoadingState.Error)}
                />
            }
            {loadingState === LoadingState.Loading && props.loadingContent}
            {loadingState === LoadingState.Error && props.errorContent}
        </React.Fragment>
    );
};
