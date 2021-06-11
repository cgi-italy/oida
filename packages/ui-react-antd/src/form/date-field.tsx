import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { DatePicker, Select, Spin } from 'antd';
import { DatePickerProps } from 'antd/lib/date-picker';
import { PanelMode } from 'rc-picker/lib/interface';
import moment from 'moment';

import { FormFieldRendererBaseProps } from '@oida/ui-react-core';
import { DateField, DATE_FIELD_ID } from '@oida/core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';


export const DateFieldRenderer = (props: FormFieldRendererBaseProps<DateField> & Omit<DatePickerProps, 'value' | 'onChange'>) => {

    const {value, onChange, title, required, config, autoFocus, ...renderProps} = props;

    const [selectableDates, setSelectableDates] = useState<{
        dates?: Set<string>,
        resolution: 'day' | 'month',
        pendingRequest?: Promise<void>
    }>({
        resolution: 'day'
    });

    const [selectableTimes, setSelectableTimes] = useState<{
        date: moment.Moment,
        times: string[],
        pendingRequest?: Promise<string[]>
    }>();

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<PanelMode>('date');

    const pickerValue = useMemo(() => value ? moment.utc(value) : undefined, [value, open]);

    const onDateChange = (value: moment.Moment | null) => {
        if (value) {
            if (!value.isUTC()) {
                value.add(value.utcOffset(), 'minutes').utc();
            }
            if (!config.withTime) {
                value.set({
                    hour: 0,
                    minute: 0,
                    second: 0
                });
            }
            value.set({millisecond: 0});
            onChange(value.toDate());
            if (config.selectableTimes) {
                //retrieve the available times for the selected date and
                //update the value with the first available time
                updateSelectableTimes(value.toDate())?.then((times) => {
                    if (times.length) {
                        const timeComponents = times[0].split(':');
                        value.set('hours', parseInt(timeComponents[0]));
                        value.set('minutes', parseInt(timeComponents[1]));
                        value.set('seconds', parseInt(timeComponents[2]));

                        onChange(value.toDate());
                    }
                });
            }
        } else {
            onChange(undefined);
        }
    };

    const onTimeChange = (time: string) => {
        const value = moment.utc(props.value);
        const timeComponents = time.split(':');
        value.set('hours', parseInt(timeComponents[0]));
        value.set('minutes', parseInt(timeComponents[1]));
        value.set('seconds', parseInt(timeComponents[2]));

        onChange(value.toDate());
    };

    const isDateSelectable = (date: moment.Moment) => {
        if (!selectableDates.dates) {
            return true;
        } else {
            if (selectableDates.resolution === 'day') {
                return selectableDates.dates.has(date.format('YYYY-MM-DD'));
            } else {
                return selectableDates.dates.has(date.format('YYYY-MM'));
            }
        }
    };

    const updateSelectableTimes = (value: Date) => {
        if (config.selectableTimes) {
            if (!selectableTimes || !selectableTimes.date.isSame(value, 'day')) {
                if (selectableTimes?.pendingRequest) {
                    if (selectableTimes.pendingRequest.cancel) {
                        selectableTimes.pendingRequest.cancel();
                    }
                    selectableTimes.pendingRequest.isCanceled = true;
                }
                const pendingRequest = config.selectableTimes(value).then((times) => {
                    if (!pendingRequest.isCanceled) {
                        setSelectableTimes({
                            date: moment(props.value),
                            times: times
                        });
                    }
                    return times;
                });
                setSelectableTimes({
                    times: [],
                    pendingRequest: pendingRequest,
                    date: moment(props.value),
                });

                return pendingRequest;
            } else {
                return selectableTimes.pendingRequest || Promise.resolve(selectableTimes.times);
            }
        }
    };

    const updateSelectableDates = (value: moment.Moment, mode: 'date' | 'month') => {
        if (typeof config.selectableDates === 'function') {
            let range;
            if (mode === 'date') {
                range = {
                    start: value.clone().startOf('month').toDate(),
                    end: value.clone().endOf('month').toDate(),
                    resolution: 'day'
                };
            } else if (mode === 'month') {
                range = {
                    start: value.clone().startOf('year').toDate(),
                    end: value.clone().endOf('year').toDate(),
                    resolution: 'month'
                };
            }
            if (range) {

                if (selectableDates.pendingRequest) {
                    if (selectableDates.pendingRequest.cancel) {
                        selectableDates.pendingRequest.cancel();
                    }
                    selectableDates.pendingRequest.isCanceled = true;
                }
                const datesRequest = config.selectableDates(range).then((dates) => {
                    if (!datesRequest.isCanceled) {
                        setSelectableDates({
                            resolution: range.resolution,
                            dates: dates
                        });
                    }
                });
                setSelectableDates({
                    resolution: range.resolution,
                    pendingRequest: datesRequest
                });
            }
        } else if (config.selectableDates instanceof Set) {
            setSelectableDates({
                dates: config.selectableDates,
                resolution: 'day'
            });
        } else {
            setSelectableDates({
                resolution: 'day'
            });
        }
    };

    useEffect(() => {
        if (config.selectableDates instanceof Set) {
            setSelectableDates({
                dates: config.selectableDates,
                resolution: 'day'
            });
        }
    }, [config.selectableDates]);

    useEffect(() => {
        if (props.value) {
            updateSelectableTimes(props.value);
        }
    }, [props.value]);

    let disabledDates;
    if (config.minDate || config.maxDate || selectableDates) {
        disabledDates = (current: moment.Moment) => {
            return (config.minDate && current.isBefore(config.minDate, 'date'))
                || (config.maxDate && current.isAfter(config.maxDate, 'date'))
                || !isDateSelectable(current);
        };
    }

    const pickerRef = useRef<any>();

    useEffect(() => {
        if (pickerRef.current) {
            const element = ReactDOM.findDOMNode(pickerRef.current) as Element | null;
            const input = element?.querySelector('input');

            // allow the calendar to change based on the input value, ignoring disabled dates
            const beforeInputChange = () => {
                setSelectableDates({
                    resolution: 'day'
                });
            };

            // restore disabled dates once the calendar page is changed
            // TODO: debounce the update invocation
            const onInputChange = (evt) => {
                const stringValue = evt.target.value;
                if (/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(stringValue)) {
                    const value = moment.utc(stringValue);
                    if (value.isValid()) {
                        setImmediate(() => {
                            if (mode === 'date' || mode === 'month') {
                                updateSelectableDates(value, mode);
                            }
                        });
                    }
                }
            };

            input?.addEventListener('beforeinput', beforeInputChange);
            input?.addEventListener('input', onInputChange);

            return () => {
                input?.removeEventListener('beforeinput', beforeInputChange);
                input?.removeEventListener('input', onInputChange);
            };
        }
    }, [pickerRef, mode]);

    return (
        <div className='date-field-wrapper'>
            <DatePicker
                ref={pickerRef}
                value={pickerValue}
                onChange={onDateChange}
                allowClear={!props.required}
                disabledDate={disabledDates}
                open={open}
                mode={mode}
                showToday={false}
                onOpenChange={(open) => {
                    if (open) {
                        setMode('date');
                        updateSelectableDates(moment.utc(value), 'date');
                    }
                    setOpen(open);
                }}
                panelRender={(panel) => {
                    return <Spin spinning={!!selectableDates.pendingRequest}>{panel}</Spin>;
                }}
                onPanelChange={(value, mode) => {
                    if (mode === 'date' || mode === 'month') {
                        updateSelectableDates(value, mode);
                    } else {
                        setSelectableDates({
                            resolution: 'day'
                        });
                    }
                    setMode(mode);
                }}
                showTime={config.withTime && !config.selectableTimes ? {
                    defaultValue: moment.utc('00:00:00', 'HH:mm:ss')
                } : false}
                {...renderProps}
            >
            </DatePicker>
            {config.withTime && config.selectableTimes &&
                <Select
                    loading={!!selectableTimes?.pendingRequest}
                    disabled={!!selectableTimes?.pendingRequest}
                    className='time-selector'
                    options={selectableTimes?.times.map((time) => {
                        return {
                            label: time,
                            value: time
                        };
                    })}
                    value={moment.utc(props.value).format('HH:mm:ss')}
                    onChange={(value) => onTimeChange(value as string)}
                />
            }
        </div>
    );

};

antdFormFieldRendererFactory.register<DateField>(
    DATE_FIELD_ID, 'datepicker',
    DateFieldRenderer
);
