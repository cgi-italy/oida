import React, { useEffect, useMemo, useState } from 'react';
import copyToClipboard from 'copy-to-clipboard';
import { Input, Button, message, Tooltip, Select, Typography } from 'antd';
import { CopyOutlined, CheckOutlined, UndoOutlined } from '@ant-design/icons';

import { AoiSupportedGeometry, AoiValue, FormFieldState } from '@oidajs/core';
import { AoiTextFormat, bboxAoiFormat, wktAoiFormat, geoJsonAoiFormat } from './aoi-text-format';

export type AoiTextEditorProps = {
    supportedGeometries: AoiSupportedGeometry[];
    formats?: AoiTextFormat[];
    readonly?: boolean;
} & FormFieldState<AoiValue>;

export const AoiTextEditor = (props: AoiTextEditorProps) => {
    const validFormats = useMemo(() => {
        const geometry = props.value?.geometry;
        if (!geometry || geometry.type === 'GeometryCollection' || geometry.type === 'GeometryCollectionEx') {
            return [];
        } else {
            return props.formats!.filter((format) => {
                return !format.geometryTypes || format.geometryTypes.includes(geometry.type);
            });
        }
    }, [props.value]);
    const [format, setFormat] = useState<AoiTextFormat>();

    const [textAreaValue, setTextAreaValue] = useState('');
    const [inputChanged, setInputChanged] = useState(false);
    const [parseError, setParseError] = useState<string>();

    useEffect(() => {
        if (validFormats.length) {
            if (!format || !validFormats.includes(format)) {
                setFormat(validFormats[0]);
            }
        } else {
            setFormat(undefined);
        }
    }, [validFormats]);

    const formatAreaValue = () => {
        let stringValue = '';
        if (props.value) {
            if (format) {
                try {
                    stringValue = format.formatter(props.value);
                } catch (e) {
                    // do nothing
                }
            }
        }
        setTextAreaValue(stringValue);
        setInputChanged(false);
        setParseError(undefined);
    };

    const applyAreaValue = (value) => {
        let aoiValue: AoiValue | undefined;
        let inputFormat: AoiTextFormat | undefined;
        for (const format of props.formats!) {
            try {
                aoiValue = format.parser(value);
                inputFormat = format;
                break;
            } catch (e) {
                // continue
            }
        }
        if (aoiValue) {
            if (!props.supportedGeometries.find((value) => value.type === aoiValue!.geometry.type)) {
                setParseError(`Unsupported geometry of type ${aoiValue.geometry.type} provided`);
            } else {
                if (inputFormat) {
                    setFormat(inputFormat);
                }
                props.onChange(aoiValue);
            }
        } else {
            setParseError('Unable to parse the provided AOI string');
        }
    };

    useEffect(() => {
        formatAreaValue();
    }, [props.value, format]);
    return (
        <div className='aoi-text-editor'>
            <div className='aoi-text-editor-format'>
                {!inputChanged && validFormats.length > 1 && (
                    <React.Fragment>
                        <span>Format:</span>
                        <Select
                            value={format?.id}
                            size='small'
                            options={validFormats.map((format) => {
                                return {
                                    value: format.id,
                                    label: format.name
                                };
                            })}
                            onChange={(value) => {
                                const format = props.formats?.find((format) => format.id === value);
                                setFormat(format);
                            }}
                        />
                    </React.Fragment>
                )}
            </div>
            <div className='aoi-text-editor-input'>
                <Input.TextArea
                    value={textAreaValue}
                    onChange={(evt) => {
                        setTextAreaValue(evt.target.value);
                        setInputChanged(true);
                    }}
                    readOnly={props.readonly}
                    placeholder={`Paste a ${props.formats?.map((format) => format.name).join(', ')} string`}
                    autoSize={{ minRows: 2, maxRows: 5 }}
                />
                <div className='aoi-text-editor-actions'>
                    {inputChanged && (
                        <Tooltip title='Apply'>
                            <Button
                                icon={<CheckOutlined />}
                                size='small'
                                onClick={() => {
                                    applyAreaValue(textAreaValue);
                                }}
                            />
                        </Tooltip>
                    )}
                    {inputChanged && (
                        <Tooltip title='Reset'>
                            <Button
                                icon={<UndoOutlined />}
                                size='small'
                                onClick={() => {
                                    formatAreaValue();
                                }}
                            />
                        </Tooltip>
                    )}
                    {!inputChanged && textAreaValue && (
                        <Tooltip title='Copy to clipboard'>
                            <Button
                                icon={<CopyOutlined />}
                                size='small'
                                onClick={() => {
                                    copyToClipboard(textAreaValue);
                                    message.info('Area copied to clipboard');
                                }}
                            />
                        </Tooltip>
                    )}
                </div>
            </div>
            {parseError && <Typography.Text type='danger'>{parseError}</Typography.Text>}
        </div>
    );
};

AoiTextEditor.defaultProps = {
    formats: [geoJsonAoiFormat, wktAoiFormat, bboxAoiFormat]
};
