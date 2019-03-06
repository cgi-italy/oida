import React from 'react';

import { LoadingState } from '@oida/core';

export type AsyncImageProps = {
    imageUrl: string | Promise<string>;
    loadingUrl?: string;
    errorUrl?: string;
    onLoad?: (state: LoadingState) => void;
};

type AsyncImageState = {
    src: string,
    loadingState: LoadingState
};


export class AsyncImage extends React.Component<AsyncImageProps, AsyncImageState> {


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

    render() {
        if (this.state.loadingState === LoadingState.Error) {
            if (this.props.errorUrl) {
                return (<img src={this.props.errorUrl}></img>);
            } else {
                return null;
            }
        } else if (this.state.loadingState === LoadingState.Loading) {
            let children = [];
            if (this.state.src) {
                children.push(
                    <img
                        key='srcImage'
                        src={this.state.src}
                        onLoad={this.onImageLoaded.bind(this)}
                        onError={this.onImageError.bind(this)}
                    ></img>
                );
            }
            if (this.props.loadingUrl) {
                children.push(<img key='spinner' src={this.props.loadingUrl}></img>);
            }
            return children;
        } else if (this.state.loadingState === LoadingState.Success) {
            return <img src={this.state.src}></img>;
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
                    this.setState({
                        src: src
                    });
                }
            });
        }
    }
}
