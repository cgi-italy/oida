import moment from 'moment';

import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const DATE_FIELD_ID = 'date';

export type SelectableDates =
    | Set<string>
    | ((range: { start: Date; end: Date; resolution: 'year' | 'month' | 'day' }) => Promise<Set<string>>);

export type DateFieldConfig = {
    minDate?: Date;
    maxDate?: Date;
    selectableDates?: SelectableDates;
    withTime?: boolean;
    selectableTimes?: (day: Date) => Promise<string[]>;
};

export type DateField = FormField<typeof DATE_FIELD_ID, Date, DateFieldConfig>;

setFormFieldSerializer(DATE_FIELD_ID, {
    toJSON: (value) => {
        return value.toISOString();
    },
    fromJSON: (value) => {
        return new Date(value);
    },
    toString: (formField, options) => {
        let config: DateFieldConfig;
        if (typeof formField.config === 'function') {
            config = formField.config(formField);
        } else {
            config = formField.config;
        }
        let dateFormat = options?.dateFormat;
        if (!dateFormat) {
            if (config.withTime) {
                dateFormat = 'YYYY-MM-DD HH:mm:ss [UTC]';
            } else {
                dateFormat = 'YYYY-MM-DD';
            }
        }
        return formField.value ? moment.utc(formField.value).format(dateFormat) : 'unspecified';
    }
});

declare module './form-field' {
    interface IFormFieldDefinitions {
        [DATE_FIELD_ID]: FormFieldDefinition<typeof DATE_FIELD_ID, Date, DateFieldConfig>;
    }

    interface IFormFieldValueTypes {
        [DATE_FIELD_ID]: Date;
    }
}
