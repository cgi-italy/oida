import React from 'react';
import ReactDOM from 'react-dom';

import scrollIntoView from 'scroll-into-view-if-needed';

export type canBeScrolledIntoViewProps = {
    scrollToItem: boolean;
};

export function canBeScrolledIntoView<T extends object>(WrappedComponent: React.ComponentClass<T>) {
    return class CanBeScrolledIntoView extends React.Component<T & canBeScrolledIntoViewProps> {

        public domRef_: React.RefObject<React.Component<T>>;

        constructor(props) {
            super(props);
            this.domRef_ = React.createRef();
        }

        componentDidMount() {
            if (this.props.scrollToItem) {
                this.scrollIntoView_();
            }
        }

        componentDidUpdate() {
            if (this.props.scrollToItem) {
                this.scrollIntoView_();
            }
        }


        render() {
            const { scrollToItem, ...props } = this.props as canBeScrolledIntoViewProps;
            // @ts-ignore
            return <WrappedComponent ref={this.domRef_} {...props} />;
        }

        scrollIntoView_() {
            if (this.domRef_.current instanceof HTMLElement) {
                scrollIntoView(this.domRef_.current, {
                    scrollMode: 'if-needed'
                });
            } else {
                let domElement = ReactDOM.findDOMNode(this.domRef_.current) as HTMLElement;
                scrollIntoView(domElement, {
                    scrollMode: 'if-needed',
                    block: 'nearest'
                });
            }
        }
    };
}
