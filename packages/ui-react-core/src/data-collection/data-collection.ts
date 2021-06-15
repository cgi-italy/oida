
import { DataCollectionItemsProps } from './data-collection-items';
import { DataPagerProps } from './data-pager';
import { DataSorterProps } from './data-sorter';
import { DataFiltererProps } from './data-filterer';

export type DataCollectionProps<T> = {
    items: DataCollectionItemsProps<T>;
    paging?: DataPagerProps;
    sorting?: DataSorterProps;
    filters?: DataFiltererProps
};

export type DataCollectionRenderer<T> = React.ComponentType<DataCollectionProps<T>>;
