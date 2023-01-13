import { FormRendererProps } from '../form';

/** {@link DataFiltererRenderer} props */
export type DataFiltererProps = FormRendererProps & {
    mainFilter?: string;
};

/** A data filtering component */
export type DataFiltererRenderer = React.ComponentType<DataFiltererProps>;
