import React, { useMemo } from 'react';

import { useSelector } from '@oida/ui-react-mobx';
import { DatasetDiscovery, DatasetExplorer } from '@oida/eo-mobx';

import { DatasetDiscoveryProviderFactory } from './dataset-discovery-provider-factory';


export type DatasetDiscoveryProviderProps = {
    datasetDiscovery: DatasetDiscovery;
    datasetExplorer: DatasetExplorer;
};

export const DatasetDiscoveryProvider = (props: DatasetDiscoveryProviderProps) => {

    const selectedProvider = useSelector(() => props.datasetDiscovery.selectedProvider);

    const discoveryContent = useMemo<React.ReactNode>(() => {
        if (selectedProvider) {
            return DatasetDiscoveryProviderFactory.create(selectedProvider.type, {
                provider: selectedProvider,
                datasetExplorer: props.datasetExplorer
            });
        } else {
            return undefined;
        }
    }, [selectedProvider]);

    // const discoveryContent = selectedProvider
    //     ? DatasetDiscoveryProviderFactory.create(selectedProvider.type, {
    //         provider: selectedProvider,
    //         datasetExplorer: props.datasetExplorer
    //     })
    //     : undefined;

    return (
        <React.Fragment key={selectedProvider?.id}>
            {discoveryContent}
        </React.Fragment>
    );
};
