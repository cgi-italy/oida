import React from 'react';
import moment from 'moment';
import { Slider, Select, InputNumber, Button, Tooltip } from 'antd';
import { StepForwardOutlined, StepBackwardOutlined } from '@ant-design/icons';

import {
    DatasetDimensions,
    DatasetDimension,
    ValueDomain,
    CategoricalDomain,
    isValueDomain,
    DatasetTimeDistributionProvider,
    TimeDistributionRangeItem,
    TimeSearchDirection,
    DimensionDomainType
} from '@oidajs/eo-mobx';
import { DateFieldRenderer } from '@oidajs/ui-react-antd';
import { useSelector } from '@oidajs/ui-react-mobx';

type TimeDimension = DatasetDimension<ValueDomain<Date>>;
type ValueDimension = DatasetDimension<ValueDomain<number>>;
type CategoricalDimension = DatasetDimension<CategoricalDomain<number | string>>;

export type DatasetValueDimensionSelectorProps = {
    dimensionsState: DatasetDimensions;
    dimension: ValueDimension;
};

export const DatasetValueDimensionSelector = (props: DatasetValueDimensionSelectorProps) => {
    const value = useSelector(() => {
        const val = props.dimensionsState.values.get(props.dimension.id);
        return val ? (val as number) : undefined;
    }, [props.dimensionsState]);

    const domain = useSelector(() => props.dimensionsState.getDimensionDomain<ValueDomain<number>>(props.dimension.id));

    if (!domain) {
        return null;
    }

    if (domain.min !== undefined && domain.max !== undefined) {
        const marks = {
            [domain.min]: `${domain.min} ${props.dimension.units}`,
            [domain.max]: `${domain.max} ${props.dimension.units}`
        };

        return (
            <div className='dataset-dimension-value-selector dataset-slider-selector'>
                <span>{props.dimension.name}: </span>
                <Slider
                    min={domain.min}
                    max={domain.max}
                    step={domain.step}
                    value={value}
                    marks={marks}
                    onChange={(value) => props.dimensionsState.setValue(props.dimension.id, value as number)}
                    tipFormatter={(value) => `${value} ${props.dimension.units}`}
                />
            </div>
        );
    } else {
        return (
            <div className='dataset-dimension-value-selector'>
                <span>{props.dimension.name}: </span>
                <InputNumber
                    value={value}
                    onChange={(value) => {
                        if (typeof value === 'number') {
                            props.dimensionsState.setValue(props.dimension.id, value);
                        }
                    }}
                />
                {props.dimension.units && <span>{props.dimension.units}</span>}
            </div>
        );
    }
};

export type DatasetTimeDimensionSelectorProps = {
    dimensionsState: DatasetDimensions;
    dimension: TimeDimension;
    timeDistributionProvider?: DatasetTimeDistributionProvider;
};

export const DatasetTimeDimensionSelector = (props: DatasetTimeDimensionSelectorProps) => {
    const domain = useSelector(() => props.dimensionsState.getDimensionDomain<ValueDomain<Date, number>>(props.dimension.id));

    const value = useSelector(() => {
        const val = props.dimensionsState.values.get(props.dimension.id);
        return val ? (val as Date) : undefined;
    }, [props.dimensionsState]);

    const timeDistributionProvider = props.timeDistributionProvider;

    return (
        <div className='dataset-dimension-value-selector'>
            <span>{props.dimension.name}: </span>
            {timeDistributionProvider && (
                <Tooltip title='Previous'>
                    <Button
                        disabled={domain && domain.min && (!value || value.getTime() <= domain.min.getTime())}
                        onClick={() => {
                            if (value) {
                                timeDistributionProvider
                                    .getNearestItem(
                                        moment(value).subtract(1, 'second').toDate(),
                                        TimeSearchDirection.Backward,
                                        props.dimensionsState
                                    )
                                    .then((value) => {
                                        if (value) {
                                            props.dimensionsState.setValue(props.dimension.id, value.start);
                                        }
                                    });
                            }
                        }}
                    >
                        <StepBackwardOutlined />
                    </Button>
                </Tooltip>
            )}
            <DateFieldRenderer
                value={value}
                onChange={(value) => props.dimensionsState.setValue(props.dimension.id, value as Date)}
                required={true}
                config={{
                    minDate: domain ? domain.min : undefined,
                    maxDate: domain ? domain.max : undefined,
                    selectableDates: timeDistributionProvider
                        ? (range) => {
                              return timeDistributionProvider.getTimeDistribution(range, props.dimensionsState, 0).then((items) => {
                                  const selectableDates: Set<string> = new Set();
                                  let format: string;
                                  if (range.resolution === 'day') {
                                      format = 'YYYY-MM-DD';
                                  } else if (range.resolution === 'month') {
                                      format = 'YYYY-MM';
                                  } else {
                                      format = 'YYYY';
                                  }
                                  items.forEach((item) => {
                                      const end = (item as TimeDistributionRangeItem).end;
                                      if (end) {
                                          const current = moment(item.start);
                                          while (current.isBefore(end, range.resolution)) {
                                              selectableDates.add(current.format(format));
                                              current.add(1, range.resolution);
                                          }
                                      } else {
                                          selectableDates.add(moment(item.start).format(format));
                                      }
                                  });
                                  return selectableDates;
                              });
                          }
                        : undefined,
                    selectableTimes: timeDistributionProvider
                        ? (date) => {
                              const dateMoment = moment(date);
                              return timeDistributionProvider
                                  .getTimeDistribution(
                                      {
                                          start: dateMoment.startOf('day').toDate(),
                                          end: dateMoment.endOf('day').toDate()
                                      },
                                      props.dimensionsState,
                                      0
                                  )
                                  .then((items) => {
                                      return items.map((item) => {
                                          return moment.utc(item.start).format('HH:mm:ss');
                                      });
                                  });
                          }
                        : undefined,
                    withTime: true
                }}
            />
            {timeDistributionProvider && (
                <Tooltip title='Next'>
                    <Button
                        disabled={domain && domain.max && (!value || value.getTime() >= domain.max.getTime())}
                        onClick={() => {
                            if (value) {
                                timeDistributionProvider
                                    .getNearestItem(
                                        moment(value).add(1, 'second').toDate(),
                                        TimeSearchDirection.Forward,
                                        props.dimensionsState
                                    )
                                    .then((value) => {
                                        if (value) {
                                            props.dimensionsState.setValue(props.dimension.id, value.start);
                                        }
                                    });
                            }
                        }}
                    >
                        <StepForwardOutlined />
                    </Button>
                </Tooltip>
            )}
        </div>
    );
};

export type DatasetCategoricalDimensionSelectorProps = {
    dimensionsState: DatasetDimensions;
    dimension: CategoricalDimension;
};

export const DatasetCategoricalDimensionSelector = (props: DatasetCategoricalDimensionSelectorProps) => {
    const value = useSelector(() => {
        return props.dimensionsState.values.get(props.dimension.id) as string | number;
    }, [props.dimensionsState]);

    const domain = useSelector(() => props.dimensionsState.getDimensionDomain<CategoricalDomain<string | number>>(props.dimension.id));

    if (!domain) {
        return null;
    }

    const domainOptions = domain.values.map((item) => {
        return (
            <Select.Option key={item.value} value={item.value}>
                {item.label || item.value}
            </Select.Option>
        );
    });

    return (
        <div className='dataset-dimension-value-selector dataset-combo-selector'>
            <span>{props.dimension.name}: </span>
            <Select
                value={value}
                placeholder='Select value'
                onChange={(value) => {
                    props.dimensionsState.setValue(props.dimension.id, value);
                }}
            >
                {domainOptions}
            </Select>
            {props.dimension.units && <span>{props.dimension.units}</span>}
        </div>
    );
};

export type DatasetDimensionSelectorProps = {
    dimensionsState: DatasetDimensions;
    dimension: DatasetDimension<DimensionDomainType>;
    timeDistributionProvider?: DatasetTimeDistributionProvider;
};

export const DatasetDimensionValueSelector = (props: DatasetDimensionSelectorProps) => {
    const domain = useSelector(() => props.dimensionsState.getDimensionDomain(props.dimension.id));

    const dimension = {
        ...props.dimension,
        domain: domain
    };

    if (!domain) {
        if (props.dimension.id === 'time') {
            return (
                <DatasetTimeDimensionSelector
                    dimensionsState={props.dimensionsState}
                    dimension={dimension as TimeDimension}
                    timeDistributionProvider={props.timeDistributionProvider}
                />
            );
        } else {
            return null;
        }
    }

    if (isValueDomain(domain)) {
        if (domain.min instanceof Date) {
            return (
                <DatasetTimeDimensionSelector
                    dimensionsState={props.dimensionsState}
                    dimension={dimension as TimeDimension}
                    timeDistributionProvider={props.timeDistributionProvider}
                />
            );
        } else {
            return <DatasetValueDimensionSelector dimensionsState={props.dimensionsState} dimension={dimension as ValueDimension} />;
        }
    } else {
        return (
            <DatasetCategoricalDimensionSelector dimensionsState={props.dimensionsState} dimension={dimension as CategoricalDimension} />
        );
    }
};
