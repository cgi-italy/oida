import { DataCollectionItemsProps } from './data-collection-items';
import { DataPagerProps } from './data-pager';
import { DataSorterProps } from './data-sorter';
import { DataFiltererProps } from './data-filterer';

/** {@link DataCollectionRenderer} props */
export type DataCollectionProps<T> = {
    items: DataCollectionItemsProps<T>;
    paging?: DataPagerProps;
    sorting?: DataSorterProps;
    filters?: DataFiltererProps;
};

/**
 * A component that render a collection of items with support for filtering, sorting and pagination
 * A composition of a {@link DataPagerRenderer}, a {@link DataFiltererRenderer}, a {@link DataSorterRenderer}
 * and a {@link DataCollectionItemsRenderer}
 **/
export type DataCollectionRenderer<T> = React.ComponentType<DataCollectionProps<T>>;
