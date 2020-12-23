import React from 'react';

import { LoadingState } from '@oida/core';

export type AsyncImageProps = {
    imageUrl: string | Promise<string>;
    loadingContent?: React.ReactNode;
    errorContent?: React.ReactNode;
    onLoad?: (state: LoadingState) => void;
};

type AsyncImageState = {
    src: string | null,
    loadingState: LoadingState
};


export class AsyncImage extends React.Component<AsyncImageProps, AsyncImageState> {

    private isMounted_ = true;

    constructor(props) {
        super(props);

        this.state = {
            src: null,
            loadingState: LoadingState.Init
        };
    }

    componentDidMount() {
        this.resetImageSrc();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.imageUrl !== this.props.imageUrl) {
            this.resetImageSrc();
        }
    }

    componentWillUnmount() {
        this.isMounted_ = false;
    }

    render() {
        if (this.state.loadingState === LoadingState.Error) {
            if (this.props.errorContent) {
                return (<React.Fragment>{this.props.errorContent}</React.Fragment>);
            } else {
                return null;
            }
        } else if (this.state.loadingState === LoadingState.Loading) {
            let children: React.ReactNode[] = [];
            if (this.state.src) {
                children.push(
                    <img
                        style={{display: 'none'}}
                        key='srcImage'
                        src={this.state.src}
                        onLoad={this.onImageLoaded.bind(this)}
                        onError={this.onImageError.bind(this)}
                    ></img>
                );
            }
            if (this.props.loadingContent) {
                children.push(<React.Fragment key='loading-content'>{this.props.loadingContent}</React.Fragment>);
            }
            return children;
        } else if (this.state.loadingState === LoadingState.Success) {
            return <img src={this.state.src!}></img>;
        } else {
            return null;
        }
    }

    protected onImageLoaded() {
        this.setState({
            loadingState: LoadingState.Success
        });
    }

    protected onImageError() {
        this.setState({
            loadingState: LoadingState.Error
        });
    }

    protected resetImageSrc() {

        let imageUrl = this.props.imageUrl;
        if (typeof(imageUrl) === 'string') {
            this.setState({
                src: imageUrl,
                loadingState: LoadingState.Loading
            });
        } else {
            this.setState({
                src: null,
                loadingState: LoadingState.Loading
            });
            imageUrl.then((src) => {
                if (imageUrl === this.props.imageUrl) {
                    if (this.isMounted_) {
                        this.setState({
                            src: src
                        });
                    }
                }
            });
        }
    }
}
