import { isDomainProvider, DataDomain, DatasetVariable } from '../common';

export const getDatasetVariableDomain = <D extends DataDomain<unknown>>(variable: DatasetVariable<D>): Promise<D | undefined> => {
    if (variable.domain) {
        if (isDomainProvider(variable.domain)) {
            return variable.domain();
        } else {
            return Promise.resolve(variable.domain);
        }
    } else {
        return Promise.resolve(undefined);
    }
};
