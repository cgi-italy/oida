import React from 'react';

import { ComponentSelectorItem, ComponentSelectorRenderer } from './component-selector';

const registeredSections : Map<string, DynamicSection> = new Map();

export type DynamicSectionState = {
    components: ComponentSelectorItem[];
    activeChild?: string;
};

export type DynamicSectionProps = {
    render: ComponentSelectorRenderer;
    sectionId: string;
};

export type ComponentInjectionOptions = {
    show?: boolean;
};

export class DynamicSection extends React.Component<DynamicSectionProps, DynamicSectionState> {

    constructor(props) {
        super(props);
        this.state = {
            components: [],
            activeChild: undefined,
        };

        registeredSections.set(props.sectionId, this);
    }

    addComponent(component: ComponentSelectorItem, options: ComponentInjectionOptions = {}) {

        this.setState((prevState, props) => {
            return {
                components: [...prevState.components, component],
                activeChild: options.show ? component.id : prevState.activeChild
            };
        });
    }

    removeComponent(component: ComponentSelectorItem) {
        this.setState((prevState, props) => {
            let components = prevState.components.slice();
            let idx = components.findIndex((c) => {
                return component.id === c.id;
            });

            if (idx !== -1) {
                components.splice(idx, 1);
                let newState: any = {
                    components: components
                };

                if (component.id === this.state.activeChild) {
                    newState.activeChild = null;
                }
                return newState;
            }
        });
    }

    updateComponent(component: ComponentSelectorItem, options) {
        this.setState((prevState, props) => {
            let components = prevState.components.slice();
            let idx = components.findIndex((c) => {
                return component.id === c.id;
            });
            if (idx !== -1) {
                components.splice(idx, 1, component);
            }
            return {
                components: components
            };
        });

    }

    componentWillUnmount() {
        registeredSections.delete(this.props.sectionId);
    }

    render() {
        const { render } = this.props;

        return render({
            ...this.state,
            onChildActivation: this.onChildActivation_.bind(this)
        });
    }

    private onChildActivation_(child) {
        this.setState({
            activeChild: child
        });
    }
}

export type SectionInjectorProps = {
    sectionId: string;
    options?: ComponentInjectionOptions
} & ComponentSelectorItem;

export class SectionInjector extends React.Component<SectionInjectorProps> {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let {sectionId, options, ...component} = this.props;
        let section = registeredSections.get(sectionId);
        if (section) {
            section.addComponent(component, options);
        }
    }

    componentWillUnmount() {
        let {sectionId, options, ...component} = this.props;
        let section = registeredSections.get(sectionId);
        if (section) {
            section.removeComponent(component);
        }
    }

    componentDidUpdate() {
        let {sectionId, options, ...component} = this.props;
        let section = registeredSections.get(sectionId);
        if (section) {
            section.updateComponent(component, options);
        }
    }

    render() {
        return null;
    }
}
