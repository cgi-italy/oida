import { FormRendererProps } from '../form';

export type DataFiltererProps = FormRendererProps & {
    mainFilter?: string;
};

export type DataFiltererRenderer = (props: DataFiltererProps) => React.ReactNode;
