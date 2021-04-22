import React, { useEffect, useMemo } from 'react';
import { useRouteMatch, Route, Redirect, Switch, useParams, useHistory } from 'react-router';
import { DatasetDiscovery, DatasetExplorer } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';
import { DatasetDiscoveryProviderFactory } from './dataset-discovery-provider-factory';
import { DatasetDiscoveryProviderTabsSelector } from './dataset-discovery-provider-tabs-selector';


const DatasetDiscoveryProviderRedirect = (props: {datasetDiscovery: DatasetDiscovery}) => {
    const { path } = useRouteMatch();

    const selectedProvider = useSelector(() => props.datasetDiscovery.selectedProvider || props.datasetDiscovery.providers[0]);
    if (selectedProvider) {
        return (
            <Redirect to={{
                pathname: `${path}/${selectedProvider.id}`,
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

export type DatasetDiscoveryProviderRouteProps = {
    datasetDiscovery: DatasetDiscovery;
    datasetExplorer: DatasetExplorer;
};

export const DatasetDiscoveryProviderRoute = (props: DatasetDiscoveryProviderRouteProps) => {

    const { providerId } = useParams<{providerId: string}>();

    useEffect(() => {
        props.datasetDiscovery.selectProvider(providerId);
    }, [providerId]);

    const discoveryContent = useMemo<React.ReactNode>(() => {
        const provider = props.datasetDiscovery.getProvider(providerId);
        if (provider) {
            return DatasetDiscoveryProviderFactory.create(provider.type, {
                provider: provider,
                datasetExplorer: props.datasetExplorer
            });
        } else {
            return undefined;
        }
    }, [providerId]);

    return (
        <React.Fragment>
            {discoveryContent}
        </React.Fragment>
    );
};

export type DatasetDiscoveryProviderRouterProps = {
    datasetDiscovery: DatasetDiscovery;
    datasetExplorer: DatasetExplorer;
};

export const DatasetDiscoveryProviderRouter = (props: DatasetDiscoveryProviderRouterProps) => {

    const { path } = useRouteMatch();

    return (
        <Switch>
            <Route exact path={path}>
                <DatasetDiscoveryProviderRedirect datasetDiscovery={props.datasetDiscovery}
                />
            </Route>
            <Route path={`${path}/:providerId`}>
                <DatasetDiscoveryProviderRoute
                    datasetDiscovery={props.datasetDiscovery}
                    datasetExplorer={props.datasetExplorer}
                />
            </Route>
        </Switch>
    );
};

export const DatasetDiscoveryProviderTabsNavigation = (props: {datasetDiscovery: DatasetDiscovery}) => {

    const providers = useSelector(() => props.datasetDiscovery.providers.slice());

    const history = useHistory();
    const { path } = useRouteMatch();
    const match = useRouteMatch<{providerId: string}>({
        path: `${path}/:providerId`
    });
    const selectedProvider = match?.params.providerId;

    return <DatasetDiscoveryProviderTabsSelector
        providers={providers}
        selectedProvider={selectedProvider}
        onProviderSelect={(providerId) => {
            history.push(`${path}/${providerId}`);
        }}
    />;
};
