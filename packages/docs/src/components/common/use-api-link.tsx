import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export type OidaModule =
    'core' | 'map-ol' | 'map-cesium' | 'state-mobx' | 'ui-react-antd' | 'ui-react-core' | 'ui-react-mobx'
    | 'eo-mobx' | 'eo-mobx-react' | 'eo-adapters-ogc' | 'eo-adapters-ogc-react' | 'eo-adapters-adam' | 'eo-geotiff'
    | 'eo-video' | 'eo-video-react';

export type TypedocsCategory = 'modules' | 'enums' | 'interfaces' | 'classes';


const parseModuleName = (name: string) => {
    return name.replace(/\-\//g, '_');
};

const getElementPath = (module: OidaModule, category?: TypedocsCategory, element?: string) => {
    if (!category || category === 'modules') {
        return `/modules/${parseModuleName(module)}.html#${element ? element.toLowerCase : ''}`;
    } else {
        return `/${category}/${parseModuleName(module)}.${element ? element.toLowerCase : ''}.html`;
    }
};

export type ApiLinkProps = {
    module: OidaModule,
    category?: TypedocsCategory,
    element?: string
};


export const useApiLink = (props: ApiLinkProps) => {
    const context = useDocusaurusContext();
    const typeDocUrl = `${context.siteConfig.customFields.typedocsLocation as string}/${getElementPath(props.module, props.category, props.element)}`;

    return typeDocUrl;
};

export const ApiLink = (props: ApiLinkProps) => {
    const linkHref = useApiLink(props);

    return <a href={linkHref} target='apidocs'/>;
};
