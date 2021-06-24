import { IFormFieldDefinition } from '@oida/core';
import { IsEntity, QueryParams, LoadingStatus } from '@oida/state-mobx';
import { DataCollectionItemsProps, DataCollectionProps, DataSortField } from '@oida/ui-react-core';

import { useSelector } from './use-selector';
import { useEntityCollectionList, UseEntityCollectionListProps } from './use-entity-collection-list';
import { useDataSorting } from './use-data-sorting';
import { useFormData } from './use-form-data';
import { useDataPaging } from './use-data-paging';


/**
 * {@Link useEntityCollection} hook props
 **/
export type UseEntityCollectionProps<T extends IsEntity> =
UseEntityCollectionListProps<T> & {
    /** The collection query parameters state */
    queryParams?: QueryParams;
    filtering?: {
        /** List of collection query filters */
        filters: IFormFieldDefinition[];
        /** Default filter name (used for simple search) */
        mainFilter?: string;
        trackFieldsDefinition?: boolean;
    }
    /** Fields supported for sorting */
    sortableFields?: DataSortField[];
    /** The data retrieval loading state */
    loadingState?: LoadingStatus;
} & Pick<DataCollectionItemsProps<T>, 'onDefaultAction' | 'multiSelect' | 'fileDropProps'>;

/**
 * A React hook that will extract from the state a set of properties to be used
 * as input for a {@Link DataCollectionRenderer}. The hook is a composition of {@Link @useEntityCollectionList},
 * {@Link useDataPaging}, {@Link useDataSorting} and {@Link useFormData} hooks
 * @param props The hook input parameters
 * @return properties to be used as input to a {@Link DataCollectionRenderer}
 */
export const useEntityCollection: <T extends IsEntity>(props: UseEntityCollectionProps<T>) => DataCollectionProps<T> | undefined =
<T extends IsEntity>(props: UseEntityCollectionProps<T>) => {

    const { items, actions, selectionManager, queryParams, filtering, sortableFields, loadingState, ...otherItemsParams } = props;
    const pagingProps = useDataPaging(queryParams?.paging);

    const filteringProps = useFormData({
        fieldValues: filtering ? queryParams?.filters : undefined,
        fields: filtering?.filters || [],
        trackFieldsDefinitions: filtering?.trackFieldsDefinition
    });

    const sortingProps = useDataSorting({
        sortingState: sortableFields ? queryParams?.sorting : undefined,
        sortableFields: sortableFields || []
    });

    const itemsProps = useEntityCollectionList<T>({
        items: items,
        actions: actions,
        selectionManager: selectionManager
    });

    const loadingStateProp = useSelector(() => loadingState?.value, [loadingState]);

    if (!itemsProps) {
        return undefined;
    }

    return {
        filters: filteringProps ? {
            ...filteringProps,
            mainFilter: filtering?.mainFilter
        } : undefined,
        sorting: sortingProps,
        paging: pagingProps,
        items: {
            loadingState: loadingStateProp,
            ...otherItemsParams,
            ...itemsProps
        }
    };
};
