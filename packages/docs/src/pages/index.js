import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

function Feature({ imageUrl, title, description }) {
    const imgUrl = useBaseUrl(imageUrl);
    return (
        <div className={clsx('col col--4', styles.feature)}>
            {imgUrl && (
                <div className='text--center'>
                    <img className={styles.featureImage} src={imgUrl} alt={title} />
                </div>
            )}
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

function Home() {
    const context = useDocusaurusContext();
    const { siteConfig = {} } = context;
    return (
        <Layout title={`${siteConfig.title}`} description='OIDA EO libraries'>
            <header className={clsx('hero', styles.heroBanner)}>
                <div className='container'>
                    <h1 className='hero__title'>
                        <img src='img/logo.webp'></img>
                        {siteConfig.title}
                    </h1>
                    <p className='hero__subtitle'>{siteConfig.tagline}</p>
                    <div className={styles.buttons}>
                        <Link className={clsx('button button--primary button--lg', styles.getStarted)} to={useBaseUrl('docs/')}>
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>
            <main></main>
        </Layout>
    );
}

export default Home;
