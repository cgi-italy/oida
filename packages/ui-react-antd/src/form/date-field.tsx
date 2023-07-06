import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DatePicker, Select, Spin, DatePickerProps } from 'antd';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { FormFieldRendererBaseProps } from '@oidajs/ui-react-core';
import { DateField, DATE_FIELD_ID } from '@oidajs/core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

dayjs.extend(utc);

export const DateFieldRenderer = (
    props: FormFieldRendererBaseProps<DateField> &
        Omit<DatePickerProps, 'value' | 'onChange' | 'picker'> & { picker?: 'date' | 'week' | 'month' | 'quarter' | 'year' }
) => {
    const { value, onChange, title, required, config, autoFocus, readonly, ...renderProps } = props;

    const [selectableDates, setSelectableDates] = useState<{
        dates?: Set<string>;
        resolution: 'day' | 'month';
        pendingRequest?: Promise<void>;
    }>({
        resolution: 'day'
    });

    const [selectableTimes, setSelectableTimes] = useState<{
        date: dayjs.Dayjs;
        times: string[];
        pendingRequest?: Promise<string[]>;
    }>();

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<DatePickerProps['mode']>('date');

    const pickerValue = useMemo(() => (value ? dayjs.utc(value) : undefined), [value, open]);

    const onDateChange = (value: dayjs.Dayjs | null) => {
        if (value) {
            if (!value.isUTC()) {
                value = value.add(value.utcOffset(), 'minutes').utc();
            }
            if (!config.withTime) {
                value = value.set('hour', 0).set('minute', 0).set('second', 0);
            }
            value = value.set('millisecond', 0);
            onChange(value.toDate());
            if (config.selectableTimes) {
                //retrieve the available times for the selected date and
                //update the value with the first available time
                updateSelectableTimes(value.toDate())?.then((times) => {
                    if (times.length) {
                        const timeComponents = times[0].split(':');
                        value = value!
                            .set('hours', parseInt(timeComponents[0]))
                            .set('minutes', parseInt(timeComponents[1]))
                            .set('seconds', parseInt(timeComponents[2]));

                        onChange(value!.toDate());
                    }
                });
            }
        } else {
            onChange(undefined);
        }
    };

    const onTimeChange = (time: string) => {
        const timeComponents = time.split(':');
        const value = dayjs
            .utc(props.value)
            .set('hours', parseInt(timeComponents[0]))
            .set('minutes', parseInt(timeComponents[1]))
            .set('seconds', parseInt(timeComponents[2]));

        onChange(value.toDate());
    };

    const isDateSelectable = (date: dayjs.Dayjs) => {
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
                            date: dayjs.utc(props.value),
                            times: times
                        });
                    }
                    return times;
                });
                setSelectableTimes({
                    times: [],
                    pendingRequest: pendingRequest,
                    date: dayjs.utc(props.value)
                });

                return pendingRequest;
            } else {
                return selectableTimes.pendingRequest || Promise.resolve(selectableTimes.times);
            }
        }
    };

    const updateSelectableDates = (value: dayjs.Dayjs, mode: 'date' | 'month') => {
        if (typeof config.selectableDates === 'function') {
            let range;
            if (mode === 'date') {
                range = {
                    start: value.startOf('month').toDate(),
                    end: value.endOf('month').toDate(),
                    resolution: 'day'
                };
            } else if (mode === 'month') {
                range = {
                    start: value.startOf('year').toDate(),
                    end: value.endOf('year').toDate(),
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
        disabledDates = (current: dayjs.Dayjs) => {
            return (
                (config.minDate && current.isBefore(config.minDate, 'date')) ||
                (config.maxDate && current.isAfter(config.maxDate, 'date')) ||
                !isDateSelectable(current)
            );
        };
    }

    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (pickerRef.current) {
            const input = pickerRef.current.getElementsByTagName('input')[0];

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
                    const value = dayjs.utc(stringValue);
                    if (value.isValid()) {
                        setTimeout(() => {
                            if (mode === 'date' || mode === 'month') {
                                updateSelectableDates(value, mode);
                            }
                        }, 0);
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
        <div className='date-field-wrapper' ref={pickerRef}>
            <DatePicker
                value={pickerValue}
                onChange={onDateChange}
                allowClear={!required && !readonly}
                disabledDate={disabledDates}
                open={open}
                mode={mode}
                showToday={false}
                // update the value on calendar select, without the need to press the "OK" button
                onSelect={config.withTime ? onDateChange : undefined}
                onOpenChange={(open) => {
                    if (readonly) {
                        return;
                    }
                    if (open) {
                        setMode('date');
                        updateSelectableDates(dayjs.utc(value), 'date');
                    }
                    setOpen(open);
                }}
                panelRender={(panel) => {
                    return <Spin spinning={!!selectableDates.pendingRequest}>{panel}</Spin>;
                }}
                inputReadOnly={readonly}
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
                showTime={
                    config.withTime && !config.selectableTimes
                        ? {
                              defaultValue: dayjs.utc('00:00:00', 'HH:mm:ss')
                          }
                        : false
                }
                {...renderProps}
            ></DatePicker>
            {config.withTime && config.selectableTimes && (
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
                    value={dayjs.utc(props.value).format('HH:mm:ss')}
                    onChange={(value) => onTimeChange(value as string)}
                />
            )}
        </div>
    );
};

antdFormFieldRendererFactory.register<DateField>(DATE_FIELD_ID, 'datepicker', DateFieldRenderer);
