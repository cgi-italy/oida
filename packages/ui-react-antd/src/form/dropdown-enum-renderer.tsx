import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { Dropdown, Avatar } from 'antd';
import { LoadingOutlined, DownOutlined } from '@ant-design/icons';

import { EnumField, ENUM_FIELD_ID, EnumChoice, LoadingState } from '@oidajs/core';
import { FormFieldRendererBaseProps } from '@oidajs/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export type DropdownEnumChoiceProps = {
    choice: EnumChoice;
};

export const DropdownEnumChoice = (props: DropdownEnumChoiceProps) => {
    return (
        <React.Fragment>
            {props.choice.icon && <Avatar size='large' src={props.choice.icon} />}
            <div className='dropdown-enum-choice-content'>
                <div className='dropdown-enum-choice-title'>{props.choice.name}</div>
                <div className='dropdown-enum-choice-description'>{props.choice.description}</div>
            </div>
        </React.Fragment>
    );
};

export type DropdownEnumOptionsProps = {
    choices: EnumChoice[];
    selectedChoice: string | undefined;
    onChoiceSelect: (value: string) => void;
};

export const DropdownEnumOptions = (props: DropdownEnumOptionsProps) => {
    const enumItems = props.choices.map((choice) => {
        return (
            <div
                className={classnames('dropdown-enum-option', { selected: choice.value === props.selectedChoice })}
                onClick={() => props.onChoiceSelect(choice.value)}
                key={choice.value}
            >
                <DropdownEnumChoice choice={choice} />
            </div>
        );
    });

    return <div className='dropdown-enum-options'>{enumItems}</div>;
};

export type DropdownEnumRendererProps = FormFieldRendererBaseProps<EnumField>;

export const DropdownEnumRenderer = (props: DropdownEnumRendererProps) => {
    const [dropDownVisible, setDropDownVisible] = useState(false);

    const [choices, setChoices] = useState<EnumChoice[]>();
    const [loadingState, setLoadingState] = useState(LoadingState.Init);

    useEffect(() => {
        if (Array.isArray(props.config.choices)) {
            setLoadingState(LoadingState.Success);
            setChoices(props.config.choices);
        } else {
            let isComponentMounted = true;
            setLoadingState(LoadingState.Loading);
            props.config
                .choices()
                .then((choices) => {
                    if (isComponentMounted) {
                        setLoadingState(LoadingState.Success);
                        setChoices(choices);
                    }
                })
                .catch((error) => {
                    if (isComponentMounted) {
                        setLoadingState(LoadingState.Error);
                    }
                });

            return () => {
                isComponentMounted = false;
            };
        }
    }, [props.config.choices]);

    const selectedChoice = (choices || []).find((choice) => choice.value === props.value);

    return (
        <Dropdown
            className='dropdown-enum-renderer'
            trigger={[]}
            placement='bottomLeft'
            onOpenChange={(visible) => setDropDownVisible(visible)}
            open={!props.readonly && dropDownVisible}
            dropdownRender={() => (
                <React.Fragment>
                    {loadingState === LoadingState.Loading && <LoadingOutlined />}
                    {loadingState === LoadingState.Success && !!choices && (
                        <DropdownEnumOptions
                            choices={choices}
                            selectedChoice={props.value as string}
                            onChoiceSelect={(value) => {
                                props.onChange(value);
                                setDropDownVisible(false);
                            }}
                        />
                    )}
                </React.Fragment>
            )}
        >
            <div
                className={classnames('dropdown-enum-option', { 'ant-dropdown-open': dropDownVisible })}
                onClick={() => setDropDownVisible(!dropDownVisible)}
            >
                {selectedChoice && <DropdownEnumChoice choice={selectedChoice} />}
                <DownOutlined />
            </div>
        </Dropdown>
    );
};

antdFormFieldRendererFactory.register<EnumField>(ENUM_FIELD_ID, 'dropdown', DropdownEnumRenderer);
