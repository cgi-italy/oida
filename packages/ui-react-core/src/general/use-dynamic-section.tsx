import React, { useContext, useReducer, useEffect } from 'react';

import { ComponentPaneItem } from './component-pane';

type DynamicSectionsState = {
    [x: string]: DynamicSectionState
};

let DynamicSectionsContext = React.createContext<any>({});

export type DynamicSectionProps = {
    sectionId: string
};

export type DynamicSectionState = {
    components: ComponentPaneItem[],
    activeComponent: string | undefined
};

const initialSectionState: DynamicSectionState = {
    components: [],
    activeComponent: undefined
};

const getOrCreateSection = (state: DynamicSectionsState, sectionId: string) => {
    if (!state[sectionId]) {
        state[sectionId] = initialSectionState;
    }
    return state[sectionId];
};

const sectionsReducer = (state: DynamicSectionsState, action) : DynamicSectionsState => {

    switch (action.type) {
        case 'createSectionState': {
            return {
                ...state,
                [action.payload]: initialSectionState
            };
        }
        case 'addComponent': {
            let {sectionId, component, options} = action.payload;
            options = options || {};

            let sectionState = getOrCreateSection(state, sectionId);

            let components;
            if (options.idx) {
                components = sectionState.components.slice();
                components.splice(options.idx, 0, component);
            } else {
                components = [...sectionState.components, component];
            }
            return {
                ...state,
                [sectionId]: {
                    components: components,
                    activeComponent: options.show ? component.id : sectionState.activeComponent
                }
            };
        }
        case 'removeComponent': {
            let {sectionId, component} = action.payload;

            let sectionState = getOrCreateSection(state, sectionId);

            let components = sectionState.components.slice();
            let idx = components.findIndex((c) => {
                return component.id === c.id;
            });

            if (idx !== -1) {
                components.splice(idx, 1);
                return {
                    ...state,
                    [sectionId]: {
                        components,
                        activeComponent: component.id === sectionState.activeComponent ? undefined : sectionState.activeComponent
                    }
                };
            }
        }
        case 'updateComponent': {
            let {sectionId, component} = action.payload;

            let sectionState = getOrCreateSection(state, sectionId);

            let components = sectionState.components.slice();
            let idx = components.findIndex((c) => {
                return component.id === c.id;
            });
            if (idx !== -1) {
                components.splice(idx, 1, component);
                return {
                    ...state,
                    [sectionId]: {
                        ...state[sectionId],
                        components
                    }
                };
            }
        }
        case 'setActiveComponent': {

            let {sectionId, componentId} = action.payload;

            return {
                ...state,
                [sectionId]: {
                    ...state[sectionId],
                    activeComponent: componentId
                }
            };
        }
    }

    return state;
};

export const DynamicSectionsProvider = (props) => {
    const [state, dispatch] = useReducer(sectionsReducer, {});

    return (
        <DynamicSectionsContext.Provider value={{ state, dispatch }}>
            {props.children}
        </DynamicSectionsContext.Provider>
    );
};


export const useDynamicSectionState = ({sectionId}: DynamicSectionProps) => {

    let {state, dispatch} = useContext(DynamicSectionsContext);

    if (!state[sectionId]) {
        dispatch({
            type: 'createSection',
            payload: sectionId
        });
    }

    return {state, dispatch};

};

export const useDynamicSection = (props: DynamicSectionProps) => {

    let {sectionId} = props;
    let {state, dispatch} = useDynamicSectionState({sectionId});

    return {
        ...state[sectionId],
        showComponent: (componentId?: string) => {
            dispatch({
                type: 'setActiveComponent',
                payload: {
                    componentId,
                    sectionId
                }
            });
        }
    };
};


export const useDynamicSectionItem = (props: DynamicSectionProps & ComponentPaneItem) => {

    let {sectionId, ...componentProps} = props;

    let {dispatch} = useDynamicSectionState({sectionId});

    useEffect(() => {
        dispatch({
            type: 'addComponent',
            payload: {
                sectionId: sectionId,
                component: componentProps,
            }
        });

        return () => {
            dispatch({
                type: 'removeComponent',
                payload: {
                    sectionId: sectionId,
                    component: componentProps
                }
            });
        };
    }, []);

};
