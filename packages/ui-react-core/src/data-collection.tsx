
import { DataCollectionItemsProps } from './data-collection-items';
import { DataPagerProps } from './data-pager';
import { DataSorterProps } from './data-sorter';

export type DataCollectionProps<T> = {
    items: DataCollectionItemsProps<T>;
    paging?: DataPagerProps;
    sorting?: DataSorterProps;
};

export type DataCollectionRenderer<T> = (props: DataCollectionProps<T>) => React.ReactNode;
