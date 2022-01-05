import React from 'react';
import { Select } from 'antd';
import { Outlet, useResolvedPath } from 'react-router-dom';

import { BreadcrumbItem, StatePathRouter, useSelector } from '@oidajs/ui-react-mobx';
import { DatasetExplorer } from '@oidajs/eo-mobx';
import { WmsDatasetDiscoveryProvider } from '@oidajs/eo-adapters-ogc';

import { WmsDiscoveryProviderResults } from './wms-discovery-provider-results';

export type WmsDiscoveryProviderRouteProps = {
    provider: WmsDatasetDiscoveryProvider;
    datasetExplorer: DatasetExplorer;
};

export const WmsDiscoveryProviderRoute = (props: WmsDiscoveryProviderRouteProps) => {
    const selectedService = useSelector(() => props.provider.selectedService);

    const servicePath = useResolvedPath('./');

    return (
        <React.Fragment>
            {selectedService && (
                <BreadcrumbItem
                    data={{
                        key: 'wms_service',
                        title: selectedService?.name,
                        link: servicePath.pathname
                    }}
                />
            )}
            <WmsDiscoveryProviderResults provider={props.provider} datasetExplorer={props.datasetExplorer} />
        </React.Fragment>
    );
};

export type WmsDiscoveryProviderProps = {
    provider: WmsDatasetDiscoveryProvider;
    datasetExplorer: DatasetExplorer;
};

export const WmsDiscoveryProvider = (props: WmsDiscoveryProviderProps) => {
    const serviceOptions = useSelector(() => {
        return props.provider.services.map((service) => {
            return (
                <Select.Option key={service.id} value={service.id}>
                    {service.name}
                </Select.Option>
            );
        });
    });

    const selectedService = useSelector(() => props.provider.selectedService);

    return (
        <div className='wms-discovery-provider'>
            <StatePathRouter
                parentRouteElement={
                    <div className='wms-discovery-provider'>
                        <div className='wms-discovery-service-selector'>
                            <label>Service:</label>
                            <Select value={selectedService?.id} onChange={(value) => props.provider.selectService(value)}>
                                {serviceOptions}
                            </Select>
                        </div>
                        <Outlet />
                    </div>
                }
                innerRouteElement={<WmsDiscoveryProviderRoute datasetExplorer={props.datasetExplorer} provider={props.provider} />}
                pathParamName='serviceId'
                routePathStateSelector={() => {
                    return props.provider.selectedService?.id;
                }}
                updateStateFromRoutePath={(routePath) => {
                    props.provider.selectService(routePath);
                }}
                defaultRoute={() => props.provider.services[0]?.id}
            />
        </div>
    );
};
