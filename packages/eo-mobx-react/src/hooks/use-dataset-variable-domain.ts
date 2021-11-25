import { useState, useEffect } from 'react';
import { DataDomain, DatasetDimensions, DatasetVariable, isDomainProvider } from '@oida/eo-mobx';
import { autorun } from 'mobx';

export type UseDatasetVariableDomainProps<D extends DataDomain<unknown>> = {
    variable: DatasetVariable<D>;
    dimensionsState?: DatasetDimensions;
};

export const useDatasetVariableDomain = <D extends DataDomain<unknown> = DataDomain<unknown>>(props: UseDatasetVariableDomainProps<D>) => {
    const [domain, setDomain] = useState<D | undefined>();

    useEffect(() => {
        setDomain(undefined);
        const domainConfig = props.variable.domain;
        let domainUpdateDisposer;
        if (domainConfig) {
            if (isDomainProvider(domainConfig)) {
                domainUpdateDisposer = autorun(() => {
                    domainConfig(props.dimensionsState).then((domain) => {
                        setDomain(domain);
                    });
                });
            } else {
                setDomain(domainConfig);
            }
        }
        return () => {
            if (domainUpdateDisposer) {
                domainUpdateDisposer();
            }
        };
    }, [props.variable, props.dimensionsState]);

    return domain;
};
