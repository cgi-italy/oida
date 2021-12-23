import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import IframeResizer from 'iframe-resizer-react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';

const TypedocContainer = () => {
    const context = useDocusaurusContext();
    const typeDocUrl = context.siteConfig.customFields.typedocsLocation;

    const location = useLocation();
    const params = queryString.parse(location.search);

    return (
        <Layout title={`OIDA APIs`} description='APIs description'>
            <main>
                <IframeResizer
                    src={`${typeDocUrl}/${params.path || 'index.html'}`}
                    sizeHeight={true}
                    style={{ width: '1px', minWidth: '100%' }}
                />
            </main>
        </Layout>
    );
};

export default TypedocContainer;
