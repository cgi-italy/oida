import React, { useContext } from 'react';
import { useObserver } from 'mobx-react-lite';

import { AppContext } from './store';
import { SpotList } from './components';

const EntityCollectionSample = () => {

    const appState = useContext(AppContext);

    const loadingState = useObserver(() => {
        return appState.loadingState;
    });

    return (
        <SpotList
            spots={appState.spots}
            loadingState={loadingState}
            selection={appState.selection}
            queryParams={appState.criteria}
        ></SpotList>
    );
};

export const sample =  {
    title: 'Entity collection example',
    component: EntityCollectionSample,
};
