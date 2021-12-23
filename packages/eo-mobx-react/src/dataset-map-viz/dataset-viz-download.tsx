import React, { useState } from 'react';
import { Select, Slider, Form, InputNumber, Modal, Typography, FormInstance } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

import { DatasetViz } from '@oidajs/eo-mobx';
import { useForm } from 'antd/lib/form/Form';

export enum DatasetDownloadFormSubmitState {
    Ready = 'Ready',
    Pending = 'Pending',
    Invalid = 'Invalid',
    Success = 'Success',
    Error = 'Error'
}

export type DatasetDownloadProps = {
    datasetViz: DatasetViz<any>;
    onSubmitStateChange: (submitState: DatasetDownloadFormSubmitState) => void;
    formId?: string;
    formInstance?: FormInstance;
};

export const DatasetVizDownload = (props: DatasetDownloadProps) => {
    const downloadConfig = props.datasetViz.dataset.config!.download!;

    const [formInstance] = useForm(props.formInstance);

    formInstance.setFieldsValue({
        format: downloadConfig!.supportedFormats[0].id,
        scale: 1
    });

    const [downloadError, setDownloadError] = useState('');
    const formatOptions = downloadConfig!.supportedFormats.map((format) => {
        return (
            <Select.Option key={format.id} value={format.id}>
                {format.name || format.id}
            </Select.Option>
        );
    });

    return (
        <div className='dataset-viz-download'>
            <Form
                id={props.formId || 'dataset-viz-download-form'}
                form={formInstance}
                layout='vertical'
                onValuesChange={(changedValues, values) => {
                    formInstance
                        .validateFields()
                        .then(() => {
                            props.onSubmitStateChange(DatasetDownloadFormSubmitState.Ready);
                        })
                        .catch((e) => {
                            if (e.errorFields.length) {
                                props.onSubmitStateChange(DatasetDownloadFormSubmitState.Invalid);
                            } else {
                                props.onSubmitStateChange(DatasetDownloadFormSubmitState.Ready);
                            }
                        });
                }}
                onFinish={(values) => {
                    setDownloadError('');
                    props.onSubmitStateChange(DatasetDownloadFormSubmitState.Pending);

                    downloadConfig
                        .downloadProvider({
                            datasetViz: props.datasetViz,
                            ...values
                        })
                        .then(() => {
                            props.onSubmitStateChange(DatasetDownloadFormSubmitState.Success);
                        })
                        .catch((error) => {
                            setDownloadError(`Unable to download data: ${error.message}`);
                            props.onSubmitStateChange(DatasetDownloadFormSubmitState.Error);
                        });
                }}
            >
                <Form.Item label='Format' name='format' rules={[{ required: true }]}>
                    <Select size='small'>{formatOptions}</Select>
                </Form.Item>
                <Form.Item
                    name='scale'
                    label='Scale'
                    className='download-scale-item'
                    rules={[{ required: true, message: 'Scale should be a number > 0 and <= 1' }]}
                >
                    <Form.Item name='scale' className='download-scale-slider'>
                        <Slider min={0.05} max={1.0} step={0.05} />
                    </Form.Item>
                    <Form.Item name='scale' className='download-scale-input'>
                        <InputNumber min={0.05} max={1} step={0.05} />
                    </Form.Item>
                </Form.Item>
            </Form>
            {downloadError && (
                <Typography.Paragraph className='error-message'>
                    <CloseCircleOutlined />
                    <span>{downloadError}</span>
                </Typography.Paragraph>
            )}
        </div>
    );
};

export type DatasetVizDownloadModalProps = {
    onClose?: () => void;
} & Omit<DatasetDownloadProps, 'onSubmitStateChange'>;

export const DatasetVizDownloadModal = (props: DatasetVizDownloadModalProps) => {
    const formId = 'dataset-viz-download-form';

    const [visible, setVisible] = useState(true);
    const [formState, setFormState] = useState<DatasetDownloadFormSubmitState>(DatasetDownloadFormSubmitState.Ready);

    const [formInstance] = useForm(props.formInstance);

    const onSubmitStateChange = (submitState: DatasetDownloadFormSubmitState) => {
        setFormState(submitState);
        if (submitState === DatasetDownloadFormSubmitState.Success) {
            setVisible(false);
        }
    };

    return (
        <Modal
            title={`${props.datasetViz.dataset.config!.name} download`}
            okButtonProps={{
                htmlType: 'submit',
                form: formId,
                loading: formState === DatasetDownloadFormSubmitState.Pending,
                disabled: formState === DatasetDownloadFormSubmitState.Invalid
            }}
            visible={visible}
            onCancel={() => setVisible(false)}
            afterClose={props.onClose}
            destroyOnClose={true}
        >
            <DatasetVizDownload formId={formId} formInstance={formInstance} onSubmitStateChange={onSubmitStateChange} {...props} />
        </Modal>
    );
};
