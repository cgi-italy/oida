import React, { useState } from 'react';
import { Form, FormProps, Input, Modal, ModalProps } from 'antd';

import { DatasetExplorerWorkspace, DatasetExplorerWorkspaceHandler } from '@oidajs/eo-mobx';

export type DatasetExplorerWorkspaceSaveFormProps = {
    workspaceHandler: DatasetExplorerWorkspaceHandler;
    onSuccess?: (workspace: DatasetExplorerWorkspace) => void;
    onError?: (error?: Error) => void;
} & Omit<FormProps, 'initialValues' | 'fields' | 'onFinish' | 'onFinishFailed'>;

export const DatasetExplorerWorkspaceSaveForm = (props: DatasetExplorerWorkspaceSaveFormProps) => {
    const { workspaceHandler, onSuccess, onError, ...formProps } = props;

    const loadedView = workspaceHandler.currentWorkspace;
    const currentViewConfig = workspaceHandler.getCurrentWorkspaceConfig();

    const [submitErrorMessage, setSubmitErrorMessage] = useState<string>();

    return (
        <Form
            layout='vertical'
            initialValues={{ name: loadedView?.name, description: loadedView?.description }}
            onFinish={(values) => {
                setSubmitErrorMessage(undefined);
                if (loadedView?.id) {
                    const viewProvider = workspaceHandler.getProvider(loadedView.provider);
                    if (viewProvider?.isSaveSupported()) {
                        const workspace = {
                            ...values,
                            id: loadedView.id,
                            config: currentViewConfig
                        };

                        return workspaceHandler.getCurrentWorkspacePreview().then((preview) => {
                            return viewProvider
                                .updateWorkspace(workspace)
                                .then((id) => {
                                    const workspaceMetadata = {
                                        ...workspace,
                                        preview: preview,
                                        provider: viewProvider.id
                                    };
                                    workspaceHandler.setCurrentWorkspace(workspaceMetadata);
                                    if (onSuccess) {
                                        onSuccess(workspaceMetadata);
                                    }
                                })
                                .catch((error) => {
                                    setSubmitErrorMessage(error.message);
                                    if (onError) {
                                        onError(error);
                                    }
                                });
                        });
                    }
                }
                const storageProvider = workspaceHandler.storageProviders[0];
                if (storageProvider) {
                    const workspace = {
                        ...values,
                        config: currentViewConfig
                    };

                    return workspaceHandler.getCurrentWorkspacePreview().then((preview) => {
                        return storageProvider
                            .saveWorkspace(workspace)
                            .then((workspaceId) => {
                                const workspaceMetadata = {
                                    ...workspace,
                                    id: workspaceId,
                                    preview: preview,
                                    provider: storageProvider.id
                                };
                                workspaceHandler.setCurrentWorkspace(workspaceMetadata);
                                if (onSuccess) {
                                    onSuccess(workspaceMetadata);
                                }
                            })
                            .catch((error) => {
                                setSubmitErrorMessage(error.message);
                                if (onError) {
                                    onError(error);
                                }
                            });
                    });
                }
            }}
            onFinishFailed={() => {
                if (props.onError) {
                    props.onError();
                }
            }}
            {...formProps}
        >
            <Form.Item name='name' rules={[{ required: true }]} label='Name'>
                <Input />
            </Form.Item>
            <Form.Item name='description' label='Description'>
                <Input.TextArea />
            </Form.Item>
            {submitErrorMessage && (
                <div className='ant-form-item-explain'>
                    <div className='ant-form-item-explain-error'>{submitErrorMessage}</div>
                </div>
            )}
        </Form>
    );
};

export type DatasetExplorerWorkspaceSaveDialogProps = DatasetExplorerWorkspaceSaveFormProps & {
    modalProps: Omit<ModalProps, 'okButtonProps'>;
};

export const DatasetExplorerWorkspaceSaveDialog = (props: DatasetExplorerWorkspaceSaveDialogProps) => {
    const { modalProps, ...formProps } = props;

    const formId = props.id || 'map-view-save-form';
    const [isPending, setPending] = useState(false);
    const [visible, setVisible] = useState(true);

    return (
        <Modal
            okButtonProps={{
                form: formId,
                htmlType: 'submit',
                loading: isPending
            }}
            onOk={() => {
                setPending(true);
            }}
            onCancel={() => setVisible(false)}
            destroyOnClose={true}
            visible={visible}
            title='Save workspace'
            {...modalProps}
        >
            <DatasetExplorerWorkspaceSaveForm
                {...formProps}
                id={formId}
                onSuccess={(workspace) => {
                    setPending(false);
                    if (props.onSuccess) {
                        props.onSuccess(workspace);
                    }
                    setVisible(false);
                }}
                onError={(error) => {
                    setPending(false);
                    if (props.onError) {
                        props.onError(error);
                    }
                }}
            />
        </Modal>
    );
};
