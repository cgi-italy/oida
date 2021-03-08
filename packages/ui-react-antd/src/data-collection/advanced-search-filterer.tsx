import React, { useState } from 'react';
import { Dropdown, Tag, Tooltip, Button, Space } from 'antd';
import { DownOutlined, UpOutlined, SearchOutlined } from '@ant-design/icons';

import { getFormFieldSerializer, IFormField } from '@oida/core';
import { DataFiltererProps } from '@oida/ui-react-core';

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
                    <Tag
                        key={filter.name}
                        closable={true} onClose={() => filter.onChange(undefined)}
                    >
                        {filter.name}:{tagContent}
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

    const { mainFilter, ...formProps } = props;
    const [advancedSearchVisible, setAdvancedSearchVisible] = useState(false);

    const tagsFilters: IFormField[] = formProps.fields.filter((filter) => {
        return (filter.name !== mainFilter && formProps.values.has(filter.name));
    }).map((filter) => {
        return {
            ...filter,
            value: formProps.values.get(filter.name),
            onChange: (value) => {
                formProps.onFieldChange(filter.name, value);
            }
        };
    });

    const clearFilters = () => {
        formProps.fields.forEach((filter) => {
            formProps.onFieldChange(filter.name, undefined);
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
                        <DataForm
                            className='antd-data-filterer'
                            {...formProps}
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
                readOnly={!mainFilter}
                value={mainFilter ? formProps.values.get(mainFilter) : undefined}
                config={{}}
                onChange={(value) => {
                    if (mainFilter) {
                        formProps.onFieldChange(mainFilter, value);
                    }
                }}
                onClick={(evt) => {
                    if (!mainFilter) {
                        setAdvancedSearchVisible(true);
                    }
                }}
                prefix={
                    <React.Fragment>
                        <SearchOutlined/>
                        <QueryFiltersTags filters={tagsFilters}/>
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
