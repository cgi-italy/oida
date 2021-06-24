import { FormRendererProps } from '../form';

/** {@Link DataFiltererRenderer} props */
export type DataFiltererProps = FormRendererProps & {
    mainFilter?: string;
};

/** A data filtering component */
export type DataFiltererRenderer = React.ComponentType<DataFiltererProps>;
