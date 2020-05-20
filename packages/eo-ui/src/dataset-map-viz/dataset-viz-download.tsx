import React, { useState } from 'react';
import { Select, Slider, Form, InputNumber, Modal, Typography } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

import { IDatasetViz } from '@oida/eo';

enum FormSubmitState {
    Ready = 'Ready',
    Pending = 'Pending',
    Success = 'Success',
    Error = 'Error'
}

export type DatasetDownloadProps = {
    datasetViz: IDatasetViz
    formId?: string;
    onSubmitStateChange: (submitState: FormSubmitState) => void
};

export const DatasetVizDownload = (props: DatasetDownloadProps) => {

    let downloadConfig = props.datasetViz.dataset.config!.download!;

    let [downloadScale, setDownloadScale] = useState(1);
    let [downloadFormat, setDownloadFormat] = useState(downloadConfig!.supportedFormats[0].id);
    let [downloadError, setDownloadError] = useState('');
    let formatOptions = downloadConfig!.supportedFormats.map((format) => {
        return (<Select.Option key={format.id} value={format.id}>{format.name || format.id}</Select.Option>);
    });

    return (
        <div className='dataset-viz-download'>
            <Form
                id={props.formId || 'dataset-viz-download-form'}
                layout='vertical'
                onFinish={(evt) => {

                    setDownloadError('');
                    props.onSubmitStateChange(FormSubmitState.Pending);

                    downloadConfig.downloadProvider.downloadMapViz({
                        datasetViz: props.datasetViz,
                        format: downloadFormat,
                        scale: downloadScale
                    }).then(() => {
                        props.onSubmitStateChange(FormSubmitState.Success);
                    }).catch((error) => {
                        setDownloadError(`Unable to download data: ${error.message}`);
                        props.onSubmitStateChange(FormSubmitState.Error);
                    });

                }}
            >
                <Form.Item label='Format'>
                    <Select
                        size='small'
                        value={downloadFormat}
                        onChange={(format) => setDownloadFormat(format)}
                    >
                        {formatOptions}
                    </Select>
                </Form.Item>
                <Form.Item label='Scale'>
                    <Slider
                        value={downloadScale}
                        onChange={(value) => setDownloadScale(value as number)}
                        min={0.05}
                        max={1.0001}
                        step={0.05}
                    />
                    <InputNumber
                        value={downloadScale}
                        onChange={(value) => {
                            if (value) {
                                setDownloadScale(value as number);
                            }
                        }}
                        min={0.05}
                        max={1}
                        step={0.05}
                    />
                </Form.Item>
            </Form>
            {downloadError &&
                <Typography.Paragraph className='error-message'>
                    <CloseCircleOutlined/>
                    <span>{downloadError}</span>
                </Typography.Paragraph>
            }
        </div>
    );
};

export type DatasetVizDownloadModalProps = {
    onClose?: () => void;
} & Omit<DatasetDownloadProps, 'onSubmitStateChange'>;

export const DatasetVizDownloadModal = (props: DatasetVizDownloadModalProps) => {

    let formId = 'dataset-viz-download-form';

    let [visible, setVisible] = useState(true);
    let [isPending, setPending] = useState(false);

    const onSubmitStateChange = (submitState: FormSubmitState) => {
        setPending(submitState === FormSubmitState.Pending);
        if (submitState === FormSubmitState.Success) {
            setVisible(false);
        }
    };

    return (
        <Modal
            title={`${props.datasetViz.dataset.config!.name} download`}
            okButtonProps={{
                htmlType: 'submit',
                form: formId,
                loading: isPending
            }}
            visible={visible}
            zIndex={1040}
            onCancel={() => setVisible(false)}
            afterClose={props.onClose}
            destroyOnClose={true}
        >
            <DatasetVizDownload formId={formId} onSubmitStateChange={onSubmitStateChange} {...props}/>
        </Modal>
    );
};
