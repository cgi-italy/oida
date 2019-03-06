export type DataPagerProps = {
    pageSize: number;
    page: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
};

export type DataPagerRenderer = (props: DataPagerProps) => React.ReactNode;
