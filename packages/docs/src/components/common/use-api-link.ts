import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export type useApiLinkProps = {
    module: 'core' | 'map-ol' | 'map-cesium' | 'state-mobx' | 'ui-react-antd' | 'ui-react-core' | 'ui-react-mobx' | 'eo-mobx' | 'eo-mobx-react',
    category?: 'modules' | 'interfaces' | 'classes',
    element?: string
};

const parseModuleName = (name: string) => {
    return name.replace(/\-/g, '_');
};

export const useApiLink = (props: useApiLinkProps) => {
    const context = useDocusaurusContext();
    const typeDocUrl = `${useBaseUrl(context.siteConfig.customFields.typedocsLocation as string)}/${props.category || 'modules'}/_oida_${parseModuleName(props.module)}.html#${props.element.toLowerCase() || ''}`;

    return typeDocUrl;
};

