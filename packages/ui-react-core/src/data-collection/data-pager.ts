/** {@link DataPagerRenderer} props */
export type DataPagerProps = {
    pageSize: number;
    page: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
};

/** A data pager component */
export type DataPagerRenderer = React.ComponentType<DataPagerProps>;
