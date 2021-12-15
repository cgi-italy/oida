import React, { useEffect } from 'react';

import { Select } from 'antd';

import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetExplorer } from '@oidajs/eo-mobx';

import { WmsDatasetDiscoveryProvider } from '@oidajs/eo-adapters-ogc';

import { useHistory, useRouteMatch, Redirect, Route, Switch, useParams } from 'react-router';
import { WmsDiscoveryProviderResults } from './wms-discovery-provider-results';


const WmsDiscoveryProviderRedirect = (props: {provider: WmsDatasetDiscoveryProvider}) => {
    const { url } = useRouteMatch();

    const selectedService = useSelector(() => props.provider.selectedService || props.provider.services[0]);
    if (selectedService) {
        return (
            <Redirect to={{
                pathname: `${url}/${selectedService.id}`,
                state: {
                    updateLocationFromState: true
                }
            }}
            />
        );
    } else {
        return null;
    }
};

export const WmsDiscoveryProviderRoute = (props: WmsDiscoveryProviderRouterProps) => {

    const { serviceId } = useParams<{serviceId: string}>();

    useEffect(() => {
        props.provider.selectService(serviceId);
    }, [serviceId]);

    return (
        <WmsDiscoveryProviderResults
            provider={props.provider}
            datasetExplorer={props.datasetExplorer}
        />
    );
};

export type WmsDiscoveryProviderRouterProps = {
    provider: WmsDatasetDiscoveryProvider;
    datasetExplorer: DatasetExplorer;
};

export const WmsDiscoveryProviderRouter = (props: WmsDiscoveryProviderRouterProps) => {

    const { path } = useRouteMatch();

    return (
        <Switch>
            <Route exact path={path}>
                <WmsDiscoveryProviderRedirect provider={props.provider}
                />
            </Route>
            <Route path={`${path}/:serviceId`}>
                <WmsDiscoveryProviderRoute
                    provider={props.provider}
                    datasetExplorer={props.datasetExplorer}
                />
            </Route>
        </Switch>
    );
};

export type WmsDiscoveryProviderProps = {
    provider: WmsDatasetDiscoveryProvider,
    datasetExplorer: DatasetExplorer
};

export const WmsDiscoveryProvider = (props: WmsDiscoveryProviderProps) => {

    const serviceOptions = useSelector(() => {
        return props.provider.services.map((service) => {
            return (
                <Select.Option
                    key={service.id}
                    value={service.id}
                >
                    {service.name}
                </Select.Option>
            );
        });
    });

    const history = useHistory();
    const { url, path } = useRouteMatch();
    const match = useRouteMatch<{serviceId: string}>({
        path: `${path}/:serviceId`
    });
    const selectedService = match?.params.serviceId;

    return (
        <div className='wms-discovery-provider'>
            <div className='wms-discovery-service-selector'>
                <label>Service:</label>
                <Select
                    value={selectedService}
                    onChange={(value) => history.push(`${url}/${value}`)}
                >
                    {serviceOptions}
                </Select>
            </div>
            <WmsDiscoveryProviderRouter
                datasetExplorer={props.datasetExplorer}
                provider={props.provider}
            />
        </div>
    );
};
