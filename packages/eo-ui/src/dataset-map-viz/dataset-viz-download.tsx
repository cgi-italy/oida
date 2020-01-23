import React, { useState } from 'react';
import { Select, Slider, Form, InputNumber, Modal } from 'antd';

import { IDatasetMapViz } from '@oida/eo';

export type DatasetDownloadProps = {
    datasetViz: IDatasetMapViz
    formId?: string;
};

export const DatasetVizDownload = (props: DatasetDownloadProps) => {

    let downloadConfig = props.datasetViz.dataset.config!.download!;

    let [downloadScale, setDownloadScale] = useState(1);
    let [downloadFormat, setDownloadFormat] = useState(downloadConfig!.supportedFormats[0].id);

    let formatOptions = downloadConfig!.supportedFormats.map((format) => {
        return (<Select.Option key={format.id} value={format.id}>{format.name || format.id}</Select.Option>);
    });

    return (
        <div className='dataset-viz-download'>
            <Form
                id={props.formId || 'dataset-viz-download-form'}
                onSubmit={(evt) => {
                    evt.preventDefault();
                    downloadConfig.downloadProvider.downloadMapViz({
                        datasetViz: props.datasetViz,
                        format: downloadFormat,
                        scale: downloadScale
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
                                setDownloadScale(value);
                            }
                        }}
                        min={0.05}
                        max={1}
                        step={0.05}
                    />
                </Form.Item>
            </Form>
        </div>
    );
};

export type DatasetVizDownloadModalProps = {
    onClose?: () => void;
} & DatasetDownloadProps;

export const DatasetVizDownloadModal = (props: DatasetVizDownloadModalProps) => {

    let formId = 'dataset-viz-download-form';

    let [visible, setVisible] = useState(true);

    return (
        <Modal
            title={`${props.datasetViz.dataset.config!.name} download`}
            okButtonProps={{
                htmlType: 'submit',
                form: formId
            }}
            visible={visible}
            zIndex={1040}
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            afterClose={props.onClose}
            destroyOnClose={true}
        >
            <DatasetVizDownload formId={formId} {...props}/>
        </Modal>
    );
};
