import React, { useState } from 'react';
import { Input, Dropdown, Tag, Tooltip, Button, Space } from 'antd';
import { DownOutlined, UpOutlined, SearchOutlined } from '@ant-design/icons';

import { DataFiltererProps } from '@oida/ui-react-core';

import { FormRenderer, InputFieldRenderer } from '../form';
import { FormFieldValues, AnyFormFieldDefinition, QueryFilter, getFormFieldSerializer } from '@oida/core';


type QueryFilterWithConfig = (QueryFilter & {config: any});
type QueryFiltersTagsProps = {
    filters: QueryFilterWithConfig[];
    onFilterClear: (key: string) => void;
};

const QueryFiltersTags = (props: QueryFiltersTagsProps) => {

    const tags = props.filters.map((filter) => {
        const serializer = getFormFieldSerializer(filter.type);
        if (serializer) {
            const tagContent = serializer.toString({
                title: filter.key, value: filter.value, config: filter.config
            });
            if (tagContent) {
                return (
                    <Tag
                        key={filter.key}
                        closable={true} onClose={() => props.onFilterClear(filter.key)}
                    >
                        {filter.key}:{tagContent}
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


export const AdvancedSearchFilterer = (props: DataFiltererProps) => {

    const [advancedSearchVisible, setAdvancedSearchVisible] = useState(false);

    const tagsFilters: QueryFilterWithConfig[] = props.filters.filter((filter) => {
        return (filter.name !== props.mainFilter && props.values.has(filter.name));
    }).map((filter) => {
        return {
            key: filter.name,
            type: filter.type,
            value: props.values.get(filter.name),
            config: filter.config
        };
    });

    const clearFilters = () => {
        props.filters.forEach((filter) => {
            props.onFilterChange(filter.name, undefined);
        });
    };

    const advancedSearchPanel = (
        <Dropdown
            trigger={[]}
            visible={advancedSearchVisible}
            onVisibleChange={(visible) => setAdvancedSearchVisible(visible)}
            overlay={
                <React.Fragment>
                    {advancedSearchVisible &&
                    <React.Fragment>
                        <FormRenderer
                            fields={props.filters}
                            values={props.values}
                            onFieldChange={props.onFilterChange}
                            className='antd-data-filterer'
                        />
                        <div className='advanced-search-actions'>
                            <Space>
                                <Button size='small' onClick={() => clearFilters()}>Reset</Button>
                                <Button size='small' type='primary' onClick={() => setAdvancedSearchVisible(false)}>OK</Button>
                            </Space>
                        </div>
                    </React.Fragment>
                    }
                </React.Fragment>

            }
            className='advanced-search-filterer'
            overlayClassName='advanced-search-filterer-dropdown'
        >
            <InputFieldRenderer
                readOnly={!props.mainFilter}
                value={props.mainFilter ? props.values.get(props.mainFilter) : undefined}
                config={{}}
                onChange={(value) => {
                    if (props.mainFilter) {
                        props.onFilterChange(props.mainFilter, value);
                    }
                }}
                onClick={(evt) => {
                    if (!props.mainFilter) {
                        setAdvancedSearchVisible(true);
                    }
                }}
                prefix={
                    <React.Fragment>
                        <SearchOutlined/>
                        <QueryFiltersTags filters={tagsFilters} onFilterClear={(key) => props.onFilterChange(key, undefined)}/>
                    </React.Fragment>
                }
                suffix={
                    <Tooltip title='Advanced filtering'>
                    {
                        advancedSearchVisible
                        ? <UpOutlined onClick={() => setAdvancedSearchVisible(false)}/>
                        : <DownOutlined onClick={() => setAdvancedSearchVisible(true)}/>
                    }
                    </Tooltip>
                }
            />
        </Dropdown>
    );

    return advancedSearchPanel;


};
