import React, { lazy, Suspense } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import { buildModuleUrl } from 'cesium';

type BrowserSampleProps = {
    sampleName: string;
};

export const BrowserSample = (props: BrowserSampleProps) => {
    const docsContext = useDocusaurusContext();

    const codeLink = `${docsContext.siteConfig.customFields.gitlabDocsUrl}/src/components/examples/${props.sampleName}`;
    const baseUrl = useBaseUrl('Cesium/');
    return (
        <div>
            <a href={codeLink} target='_black'>
                Code link
            </a>
            <BrowserOnly>
                {() => {
                    // @ts-ignore
                    buildModuleUrl.setBaseUrl(baseUrl);

                    const SampleComponent = lazy(() => {
                        return import(`./${props.sampleName}/${props.sampleName}`).then((sampleModule) => {
                            return {
                                default: sampleModule.default
                            };
                        });
                    });

                    return (
                        <Suspense fallback={<div>Loading...</div>}>
                            <div className='oida-sample'>
                                <SampleComponent />
                            </div>
                        </Suspense>
                    );
                }}
            </BrowserOnly>
        </div>
    );
};
