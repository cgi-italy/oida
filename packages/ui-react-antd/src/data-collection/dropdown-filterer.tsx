import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Select, Space, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import debounce from 'lodash/debounce';

import { getFormFieldSerializer } from '@oidajs/core';
import { DataFiltererProps } from '@oidajs/ui-react-core';

import { DataForm, InputFieldRenderer } from '../form';

export type DropdownFiltererProps = {
    expandButtonTooltip?: string;
    searchIcon?: React.ReactNode;
    expandButtonIcon?: React.ReactNode;
    maxTagCount?: number | 'responsive';
} & DataFiltererProps;

export const DropdownFilterer = (props: DropdownFiltererProps) => {
    const { mainFilter, expandButtonTooltip, expandButtonIcon, searchIcon, maxTagCount, ...formProps } = props;
    const [formVisible, setFormVisible] = useState(false);

    const tags = formProps.fields
        .filter((filter) => {
            return filter.name !== mainFilter && formProps.values.has(filter.name) && !filter.hidden;
        })
        .map((filter) => {
            const value = formProps.values.get(filter.name);
            const serializer = getFormFieldSerializer(filter.type);
            if (serializer) {
                const tagContent = serializer.toString({
                    ...filter,
                    value: value,
                    onChange: (value) => {
                        formProps.onFieldChange(filter.name, value);
                    }
                });
                if (tagContent) {
                    return {
                        label: `${filter.title || filter.name}: ${tagContent}`,
                        value: filter.name
                    };
                }
            }
            return {
                label: '',
                value: filter.name
            };
        });

    const dropdownFormClassName = 'dropdown-filterer-form';

    const ignoreNextDocumentClick = useRef(false);
    useEffect(() => {
        if (formVisible) {
            const onDocumentClick = (evt: MouseEvent) => {
                if (!(evt.target as HTMLElement).closest(`.${dropdownFormClassName}`)) {
                    if (!ignoreNextDocumentClick.current) {
                        setFormVisible(false);
                    }
                }
                ignoreNextDocumentClick.current = false;
            };
            document.addEventListener('mousedown', onDocumentClick);

            return () => {
                document.removeEventListener('mousedown', onDocumentClick);
            };
        }
    }, [formVisible]);

    const elementRef = useRef<HTMLDivElement>(null);

    const enableAdvancedSearchForm =
        !mainFilter ||
        formProps.fields.some((filter) => {
            return filter.name !== mainFilter;
        });

    const clearFilters = () => {
        formProps.fields.forEach((filter) => {
            formProps.onFieldChange(filter.name, undefined);
        });
    };

    const inputSearchValue = props.mainFilter ? props.values.get(props.mainFilter) : ' ';

    const [searchValue, setSearchValue] = useState(inputSearchValue);

    useEffect(() => {
        setSearchValue(inputSearchValue);
    }, [inputSearchValue]);

    const onSearchChange = useMemo(() => {
        return debounce((value) => {
            if (props.mainFilter) {
                props.onFieldChange(props.mainFilter, value);
            }
        }, 1000);
    }, []);

    const inputSearchIcon = props.searchIcon || (props.mainFilter ? <SearchOutlined /> : <FilterOutlined />);

    return (
        <div className={classnames('dropdown-filterer', { 'is-searchable': !!props.mainFilter })} ref={elementRef}>
            {enableAdvancedSearchForm ? (
                <React.Fragment>
                    {inputSearchIcon}
                    <Select
                        mode='tags'
                        value={tags.map((option) => option.value)}
                        onSearch={(value) => {
                            if (!formVisible) {
                                setSearchValue(value);
                                onSearchChange(value);
                            } else {
                                setFormVisible(false);
                            }
                        }}
                        onMouseDown={(evt) => {
                            if (formVisible) {
                                ignoreNextDocumentClick.current = true;
                            }
                            const target = evt.target as HTMLElement;
                            if (target.closest('.dropdown-filterer') === elementRef.current) {
                                if (props.mainFilter) {
                                    if (target.className === 'ant-select-selection-item-content') {
                                        setFormVisible(!formVisible);
                                    } else {
                                        if (target.className === 'ant-select-selection-overflow') {
                                            const input: HTMLInputElement = target.getElementsByTagName('input')[0];
                                            input.setSelectionRange(input.value.length, input.value.length);
                                            input.blur();
                                            input.focus();
                                        } else if (target.className === 'ant-select-selector') {
                                            const input: HTMLInputElement = target.getElementsByTagName('input')[0];
                                            input.setSelectionRange(0, 0);
                                            input.blur();
                                            input.focus();
                                        }
                                        setFormVisible(false);
                                    }
                                } else {
                                    setFormVisible(!formVisible);
                                }
                            } else {
                                setTimeout(() => {
                                    const input: HTMLInputElement | undefined = elementRef.current?.getElementsByTagName('input')[0];
                                    input?.blur();
                                });
                            }
                        }}
                        autoClearSearchValue={false}
                        allowClear={false}
                        onDeselect={(value) => {
                            props.onFieldChange(value, undefined);
                            setFormVisible(false);
                        }}
                        dropdownClassName='dropdown-filterer-form'
                        options={tags}
                        // in non searchable case we set a non empty string to prevent the default backspace clear behaviour
                        searchValue={searchValue}
                        open={enableAdvancedSearchForm && formVisible}
                        showSearch={!!props.mainFilter}
                        showArrow={false}
                        maxTagCount={maxTagCount}
                        dropdownRender={(menu) => {
                            return (
                                <React.Fragment>
                                    <DataForm className='antd-data-filterer' size='middle' {...formProps} />
                                    <Space className='dropdown-filterer-form-actions'>
                                        <Button onClick={() => clearFilters()}>Reset</Button>
                                        <Button type='primary' onClick={() => setFormVisible(false)}>
                                            Close
                                        </Button>
                                    </Space>
                                </React.Fragment>
                            );
                        }}
                    />
                    <Tooltip title='Filtering options'>
                        <Button
                            size='small'
                            onMouseDown={() => {
                                if (formVisible) {
                                    ignoreNextDocumentClick.current = true;
                                }
                            }}
                            onClick={(evt) => {
                                setFormVisible(!formVisible);
                            }}
                        >
                            {formVisible ? <UpOutlined /> : <DownOutlined />}
                        </Button>
                    </Tooltip>
                </React.Fragment>
            ) : (
                <InputFieldRenderer
                    value={searchValue}
                    onChange={(value) => {
                        setSearchValue(value);
                        onSearchChange(value);
                    }}
                    config={{}}
                    changeDelay={0}
                    prefix={inputSearchIcon}
                />
            )}
        </div>
    );
};
