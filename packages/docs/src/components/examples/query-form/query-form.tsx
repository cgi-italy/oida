import React from 'react';
import { App as AntdApp } from 'antd';
import { DataFilters } from '@oidajs/state-mobx';
import { useFormData } from '@oidajs/ui-react-mobx';
import { QueryFilter, IFormFieldDefinition, getFormFieldSerializer, IFormFieldType } from '@oidajs/core';
import { DataForm } from '@oidajs/ui-react-antd';
import { observer } from 'mobx-react';

import './query-form.less';

type StatefulFormProps = {
    formState: DataFilters;
    fields: IFormFieldDefinition[];
};

const StatefulForm = (props: StatefulFormProps) => {
    const formProps = useFormData({
        fields: props.fields,
        fieldValues: props.formState
    });

    return <DataForm {...formProps} />;
};

type FormSerializerProps = {
    formState: DataFilters<QueryFilter>;
    fields: IFormFieldDefinition[];
};

const FormSerializer = observer((props: FormSerializerProps) => {
    const filters = props.fields
        .filter((filter) => props.formState.items.has(filter.name))
        .map((filter) => {
            const f = props.formState.get(filter.name);
            const serializer = getFormFieldSerializer<IFormFieldType>(f.type);
            const valueString = serializer.toString({
                ...filter,
                value: f.value,
                onChange: () => {
                    // do nothing
                }
            });
            return <div key={filter.name}>{`${filter.title || filter.name}: ${valueString}`}</div>;
        });
    return <div>{filters}</div>;
});

const formState = new DataFilters<QueryFilter>();
const formFields: IFormFieldDefinition[] = [
    {
        name: 'q',
        type: 'string',
        title: 'Filter',
        autoFocus: true,
        config: {}
    },
    {
        name: 'time',
        title: 'Time',
        type: 'date',
        config: {
            withTime: true
        }
    },
    {
        name: 'timerange',
        title: 'Time range',
        type: 'daterange',
        config: {
            withTime: true
        }
    },
    {
        name: 'type',
        type: 'enum',
        title: 'Select',
        config: {
            choices: [
                {
                    name: 'a',
                    value: 'a'
                },
                {
                    name: 'b',
                    value: 'b'
                }
            ]
        }
    },
    {
        name: 'flag',
        type: 'boolean',
        title: 'Boolean flag',
        config: {},
        rendererConfig: {
            id: 'switch',
            props: {
                size: 'small'
            }
        }
    },
    {
        name: 'numeric',
        type: 'numeric',
        title: 'Numeric',
        config: {
            min: 0
        },
        required: true,
        rendererConfig: {
            props: {
                precision: 0
            }
        }
    },
    {
        name: 'numeric_range',
        type: 'numericrange',
        title: 'Numeric range',
        config: {}
    }
];

const QueryForm = () => {
    return (
        <AntdApp>
            <StatefulForm fields={formFields} formState={formState} />
            <FormSerializer fields={formFields} formState={formState} />
        </AntdApp>
    );
};

export default QueryForm;
