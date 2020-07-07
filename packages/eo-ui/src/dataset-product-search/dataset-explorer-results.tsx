import React, { useEffect } from 'react';

import { useObserver } from 'mobx-react';
import { Tabs, Badge } from 'antd';

import { IEntitySelection } from '@oida/state-mst';

import { IDatasetsExplorer } from '@oida/eo';

import { DatasetSearchResultsList } from './dataset-search-results-list';


export type DatasetExplorerResultsProps = {
    explorerState: IDatasetsExplorer;
    selection: IEntitySelection,
    tabsExtraContent?: React.ReactNode,
    onVisualizeProduct: (dataset, item) => void;
};

export const DatasetExplorerResults = (props: DatasetExplorerResultsProps) => {

    useEffect(() => {
        props.explorerState.setProductExplorerActive(true);
        return () => {
            props.explorerState.setProductExplorerActive(false);
        };
    }, []);

    let panes = useObserver(() => {
        return props.explorerState.datasetViews.map(({dataset, productSearchViz}) => {
            return (
                <Tabs.TabPane
                    tab={<React.Fragment><Badge color={dataset.config.color}></Badge>{dataset.config.name}</React.Fragment>}
                    key={dataset.id}
                >
                    <DatasetSearchResultsList
                        queryParams={dataset.searchParams}
                        results={productSearchViz!.products}
                        loadingState={productSearchViz!.loadingState}
                        selection={props.selection}
                        itemContent={dataset.config.search!.searchItemContent}
                        onVisualizeItemAction={(item) => {
                            props.explorerState.setSelectedDate(item.start);
                            props.onVisualizeProduct(dataset, item);
                        }}
                    />
                </Tabs.TabPane>
            );
        });
    });

    return (
        <React.Fragment>
            {!panes.length &&
                <div>No dataset selected</div>
            }
            {!!panes.length &&
                <Tabs className='explorer-results'
                    tabBarExtraContent={props.tabsExtraContent}
                >
                    {panes}
                </Tabs>
            }
        </React.Fragment>
    );
};

