import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import IframeResizer from 'iframe-resizer-react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';

const TypedocContainer = () => {

    const context = useDocusaurusContext();
    const typeDocUrl = useBaseUrl(context.siteConfig.customFields.typedocsLocation);

    const location = useLocation();
    const params = queryString.parse(location.search);
    console.log(params);
    return (
        <Layout
            title={`OIDA APIs`}
            description="APIs description"
        >
            <main>
                <IframeResizer
                    src={`${typeDocUrl}/${params.path || ''}`}
                    sizeHeight={true}
                    style={{ width: '1px', minWidth: '100%'}}
                />
            </main>
        </Layout>
    );
}

export default TypedocContainer;
