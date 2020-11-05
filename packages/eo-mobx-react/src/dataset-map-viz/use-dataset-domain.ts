import { useState, useEffect } from 'react';
import { DataDomain, isDomainProvider, DatasetDimension } from '@oida/eo-mobx';

type useDatasetDomainProps<T extends DataDomain<unknown, unknown>> = {
    dimension: DatasetDimension<T>;
};

export const useDatasetDomain = <T extends DataDomain<unknown, unknown>>(props: useDatasetDomainProps<T>) => {
    const [domain, setDomain] = useState<T | undefined>();

    useEffect(() => {
        if (props.dimension.domain) {
            if (isDomainProvider(props.dimension.domain)) {
                props.dimension.domain().then((domain) => {
                    setDomain(domain);
                });
            } else {
                setDomain(props.dimension.domain);
            }
        }
    }, [props.dimension]);

    return domain;
};
