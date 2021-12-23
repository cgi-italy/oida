import { DataCollectionItemsProps } from './data-collection-items';
import { DataPagerProps } from './data-pager';
import { DataSorterProps } from './data-sorter';
import { DataFiltererProps } from './data-filterer';

/** {@Link DataCollectionRenderer} props */
export type DataCollectionProps<T> = {
    items: DataCollectionItemsProps<T>;
    paging?: DataPagerProps;
    sorting?: DataSorterProps;
    filters?: DataFiltererProps;
};

/**
 * A component that render a collection of items with support for filtering, sorting and pagination
 * A composition of a {@Link DataPagerRenderer}, a {@Link DataFiltererRenderer}, a {@Link DataSorterRenderer}
 * and a {@Link DataCollectionItemsRenderer}
 **/
export type DataCollectionRenderer<T> = React.ComponentType<DataCollectionProps<T>>;
