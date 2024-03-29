import React, { useState } from 'react';
import { Dropdown, Tag, Tooltip, Button, Space } from 'antd';
import { DownOutlined, UpOutlined, SearchOutlined } from '@ant-design/icons';
import classnames from 'classnames';

import { getFormFieldSerializer, IFormField } from '@oidajs/core';
import { DataFiltererProps } from '@oidajs/ui-react-core';

import { DataForm, InputFieldRenderer } from '../form';

type QueryFiltersTagsProps = {
    filters: IFormField[];
};

const QueryFiltersTags = (props: QueryFiltersTagsProps) => {
    const tags = props.filters.map((filter) => {
        const serializer = getFormFieldSerializer(filter.type);
        if (serializer) {
            const tagContent = serializer.toString(filter);
            if (tagContent) {
                return (
                    <Tag key={filter.name} closable={true} onClose={() => filter.onChange(undefined)}>
                        {filter.title || filter.name}:{tagContent}
                    </Tag>
                );
            } else {
                return null;
            }
        } else {
            return null;
        }
    });

    return (
        <div className='query-filters-tags' onClick={(evt) => evt.preventDefault()}>
            {tags}
        </div>
    );
};

export type AdvancedSearchFiltererProps = {
    expandButtonTooltip?: string;
    searchIcon?: React.ReactNode;
    expandButtonIcon?: React.ReactNode;
} & DataFiltererProps;

/**
 * @deprecated Use {@link DropdownFilterer} instead
 */
export const AdvancedSearchFilterer = (props: AdvancedSearchFiltererProps) => {
    const { mainFilter, expandButtonTooltip, expandButtonIcon, searchIcon, ...formProps } = props;
    const [advancedSearchVisible, setAdvancedSearchVisible] = useState(false);

    const tagsFilters: IFormField[] = formProps.fields
        .filter((filter) => {
            return filter.name !== mainFilter && formProps.values.has(filter.name);
        })
        .map((filter) => {
            return {
                ...filter,
                value: formProps.values.get(filter.name),
                onChange: (value) => {
                    formProps.onFieldChange(filter.name, value);
                }
            };
        });

    const enableAdvancedSearch =
        !mainFilter ||
        formProps.fields.some((filter) => {
            return filter.name !== mainFilter;
        });

    const clearFilters = () => {
        formProps.fields.forEach((filter) => {
            formProps.onFieldChange(filter.name, undefined);
        });
    };

    const inputSearchIcon = props.searchIcon || <SearchOutlined />;

    const advancedSearchPanel = (
        <Dropdown
            trigger={[]}
            open={advancedSearchVisible}
            onOpenChange={(visible) => setAdvancedSearchVisible(visible)}
            dropdownRender={() => (
                <React.Fragment>
                    {advancedSearchVisible && (
                        <React.Fragment>
                            <DataForm className='antd-data-filterer' {...formProps} />
                            <div className='advanced-search-actions'>
                                <Space>
                                    <Button onClick={() => clearFilters()}>Reset</Button>
                                    <Button type='primary' onClick={() => setAdvancedSearchVisible(false)}>
                                        OK
                                    </Button>
                                </Space>
                            </div>
                        </React.Fragment>
                    )}
                </React.Fragment>
            )}
            className={classnames('advanced-search-filterer', { 'without-main-filter': !mainFilter })}
            overlayClassName='advanced-search-filterer-dropdown'
        >
            <InputFieldRenderer
                readOnly={!mainFilter}
                allowClear={true}
                value={mainFilter ? formProps.values.get(mainFilter) : undefined}
                config={{}}
                onChange={(value) => {
                    if (mainFilter) {
                        formProps.onFieldChange(mainFilter, value);
                    }
                }}
                onClick={(evt) => {
                    if (!mainFilter) {
                        setAdvancedSearchVisible(!advancedSearchVisible);
                    }
                }}
                prefix={
                    <React.Fragment>
                        <span className='input-prefix-icon'>{inputSearchIcon}</span>
                        <QueryFiltersTags filters={tagsFilters} />
                    </React.Fragment>
                }
                suffix={
                    !mainFilter || enableAdvancedSearch ? (
                        <React.Fragment>
                            {!!mainFilter && enableAdvancedSearch && (
                                <Tooltip title={expandButtonTooltip || 'Advanced filtering'}>
                                    {advancedSearchVisible ? (
                                        <UpOutlined onClick={() => setAdvancedSearchVisible(false)} />
                                    ) : (
                                        <DownOutlined onClick={() => setAdvancedSearchVisible(true)} />
                                    )}
                                </Tooltip>
                            )}
                            {!mainFilter && (
                                <Tooltip title={expandButtonTooltip || 'Filters'}>
                                    {advancedSearchVisible ? (
                                        <UpOutlined onClick={() => setAdvancedSearchVisible(false)} />
                                    ) : (
                                        <DownOutlined onClick={() => setAdvancedSearchVisible(true)} />
                                    )}
                                </Tooltip>
                            )}
                        </React.Fragment>
                    ) : undefined
                }
            />
        </Dropdown>
    );

    return advancedSearchPanel;
};
