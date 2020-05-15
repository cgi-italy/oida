import React, { useState, useEffect } from 'react';

import debounce from 'lodash/debounce';

import { Select, Button, Input, Form } from 'antd';

import { Geometry, GeometryTypes } from '@oida/core';
import { AoiValue, FormFieldState } from '@oida/core';


const parseCoordString = (coordString: string = '') => {
    try {
        let coord = coordString.split(',').map((stringValue) => {
            return parseFloat(stringValue);
        });

        if (coord.length !== 2) {
            return undefined;
        }
        if (coord[0] >= -180 && coord[0] <= 180 && coord[1] >= -90 && coord[1] <= 90) {
            return coord;
        } else {
            return undefined;
        }
    } catch (e) {
        return undefined;
    }
};

export type PointEditorProps = {
    value: number[] | undefined;
    onChange: (value: number[] | undefined) => void;
};

export const PointEditor = (props: PointEditorProps) => {

    const parsePoint = (inputValue) => {
        props.onChange(parseCoordString(inputValue));
    };

    let onInputChange = debounce(parsePoint, 1000);

    return (
        <Input
            size='small'
            defaultValue={props.value ? props.value.join(', ') : undefined}
            onChange={(evt) => {
                props.onChange(undefined);
                onInputChange(evt.target.value);
            }}
            placeholder='Longitude, Latidude'
        />
    );
};

export type BBoxEditorProps = {
    value: number[] | undefined;
    onChange: (value: number[] | undefined) => void;
};

export const BBoxEditor =  (props: BBoxEditorProps) => {

    let defaultLowerLeft = props.value ? [props.value[0], props.value[1]].join(', ') : undefined;
    let defaultUpperRight = props.value ? [props.value[2], props.value[3]].join(', ') : undefined;

    let [lowerLeft, setLowerLeft] = useState(parseCoordString(defaultLowerLeft));
    let [upperRight, setUpperRight] = useState(parseCoordString(defaultUpperRight));

    useEffect(() => {
        if (lowerLeft && upperRight) {

            props.onChange([
                Math.min(lowerLeft[0], upperRight[0]),
                Math.min(lowerLeft[1], upperRight[1]),
                Math.max(lowerLeft[0], upperRight[0]),
                Math.max(lowerLeft[1], upperRight[1])
            ]);
        } else {
            props.onChange(undefined);
        }
    }, [lowerLeft, upperRight]);

    const parseCorner = (inputValue, setCorner) => {
        setCorner(parseCoordString(inputValue));
    };

    let onCornerChange = debounce(parseCorner, 1000);

    return (
        <Form>
            <Form.Item
                label='First corner'
            >
                <Input
                    size='small'
                    defaultValue={defaultLowerLeft}
                    onChange={(evt) => {
                        props.onChange(undefined);
                        onCornerChange(evt.target.value, setLowerLeft);
                    }}
                    placeholder='Longitude, Latidude'
                />
            </Form.Item>
            <Form.Item
                label='Second corner'
            >
                <Input
                    size='small'
                    defaultValue={defaultUpperRight}
                    onChange={(evt) => {
                        props.onChange(undefined);
                        onCornerChange(evt.target.value, setUpperRight);
                    }}
                    placeholder='Longitude, Latidude'
                />
            </Form.Item>
        </Form>
    );
};

export const PolygonEditor = (props) => {
    let textValue = '';

    if (props.value) {
        let coords = props.value[0].map((coord) => {
            return coord.join(', ');
        });

        textValue = coords.join('\n');
    }

    return (
        <Input.TextArea
            placeholder={`Longitude, Latidude\nLongitude, Latitude\n...`}
            autosize={{maxRows: 10}}
            defaultValue={textValue}
        />
    );
};

export type AoiEditorProps = {
    supportedGeometries: GeometryTypes[];
    onDone: () => void;
} & FormFieldState<AoiValue>;

export const AoiEditor = (props: AoiEditorProps) => {
    const { value, onChange, supportedGeometries } = props;

    let [geometryValue, setGeometryValue ] = useState<Partial<Geometry> | undefined>(value ? value.geometry : undefined);

    useEffect(() => {
        setGeometryValue(value ? value.geometry : undefined);
    }, [value]);


    let selectOptions = supportedGeometries.map((geometryType) => {
        return <Select.Option key={geometryType} value={geometryType}>{geometryType}</Select.Option>;
    });

    let editor: React.ReactNode | null = null;

    let geometryValid = false;

    if (geometryValue) {
        switch (geometryValue.type) {
            case 'Point':
                editor = <PointEditor
                    value={geometryValue.coordinates}
                    onChange={(value) => setGeometryValue({
                        type: 'Point',
                        coordinates: value
                    })}/>;
                geometryValid = geometryValue.coordinates !== undefined;
                break;
            case 'BBox':
                editor = <BBoxEditor
                    value={geometryValue.bbox}
                    onChange={(value) => setGeometryValue({
                        type: 'BBox',
                        bbox: value as GeoJSON.BBox | undefined
                    })}/>;
                geometryValid = geometryValue.bbox !== undefined;
                break;
            case 'Polygon':
                editor = <PolygonEditor
                    value={geometryValue.coordinates}
                    onChange={(value) => setGeometryValue({
                        type: 'Polygon',
                        coordinates: value
                    })}/>;
                geometryValid = geometryValue.coordinates !== undefined;
            default:
                break;
        }
    }

    return (
        <div className='aoi-editor'>
            <Select
                size='small'
                placeholder='Select a geometry type'
                value={geometryValue ? geometryValue.type : undefined}
                onChange={(geometryType) => {
                    let geometry: Partial<Geometry> | undefined;

                    if (geometryType === 'BBox') {
                        geometry = {
                            type: 'BBox'
                        };
                    } else if (geometryType === 'Circle') {
                        geometry = {
                            type: 'Circle'
                        };
                    } else if (geometryType) {
                        geometry = {
                            type: geometryType
                        };
                    }

                    setGeometryValue(geometry);
                }}
            >
                {selectOptions}
            </Select>
            <div>
                {editor}
            </div>
            <Button.Group
                className='aoi-editor-actions'
            >
                <Button
                    size='small'
                    type='primary'
                    disabled={!geometryValid}
                    onClick={() => {
                        props.onChange({
                            geometry: geometryValue as Geometry
                        });
                        props.onDone();
                    }}
                >
                    OK
                </Button>
                <Button size='small' onClick={() => props.onDone()}>Cancel</Button>
            </Button.Group>
        </div>
    );
};
