import { useState, useEffect } from 'react';
import { DataDomain, DatasetVariable, isDomainProvider } from '@oida/eo-mobx';

export type UseDatasetVariableDomainProps<D extends DataDomain<unknown>> = {
    variable: DatasetVariable<D>;
    onDomainReady?: (domain: D | undefined) => void;
};

export const useDatasetVariableDomain = <D extends DataDomain<unknown> = DataDomain<unknown>>(props: UseDatasetVariableDomainProps<D>) => {
    const [domain, setDomain] = useState<D | undefined>();

    useEffect(() => {
        setDomain(undefined);
        if (props.variable.domain) {
            if (isDomainProvider(props.variable.domain)) {
                props.variable.domain().then((domain) => {
                    setDomain(domain);
                });
            } else {
                setDomain(props.variable.domain);
            }
        }
    }, [props.variable]);

    useEffect(() => {
        if (props.onDomainReady) {
            props.onDomainReady(domain);
        }
    }, [domain]);

    return domain;
};
