const path = require('path');

const deploymentUrl = process.env.DEPLOYMENT_URL || 'http://localhost:3000';
const baseUrl = process.env.BASE_URL || '/';
const gitlabRepoUrl = process.env.GITLAB_URL || 'https://gitlab.dev.eoss-cloud.it/frontend/oida';
const gitlabBranch = process.env.GITLAB_BRANCH || 'master';

module.exports = {
    title: 'OIDA',
    tagline: 'Earth Observation Data Visualization and Analysis Library',
    url: deploymentUrl,
    baseUrl: baseUrl,
    onBrokenLinks: 'throw',
    favicon: 'img/favicon.ico',
    organizationName: 'CGI',
    projectName: 'oida',
    themeConfig: {
        navbar: {
            title: 'OIDA',
            logo: {
                alt: 'My Site Logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    to: 'docs/',
                    activeBasePath: 'docs',
                    label: 'Docs',
                    position: 'left',
                },
                { to: 'blog', label: 'Blog', position: 'left' },
                {
                    href: `${deploymentUrl}${baseUrl}typedocs`,
                    label: 'Api docs',
                    position: 'left'
                },
                {
                    href: `${gitlabRepoUrl}`,
                    label: 'Gitlab',
                    position: 'right',
                    className: 'gitlab-link'
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Description',
                            to: 'docs/',
                        },
                        {
                            label: 'Examples',
                            to: 'docs/examples/map-simple',
                        },
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'Blog',
                            to: 'blog',
                        },
                        {
                            label: 'Gitlab',
                            href: `${gitlabRepoUrl}`,
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} OIDA`,
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    // Please change this to your repo.
                    editUrl:
                        `${gitlabRepoUrl}/edit/${gitlabBranch}/packages/docs`,
                },
                blog: {
                    showReadingTime: true,
                    // Please change this to your repo.
                    editUrl:
                        `${gitlabRepoUrl}/edit/${gitlabBranch}/packages/docs`,
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],
    plugins: [
        [
            require.resolve("docusaurus-plugin-less"),
            {
                sourceMap: true,
                lessOptions: {
                    javascriptEnabled: true
                }
            }
        ],
        path.resolve(__dirname, 'plugins/custom-webpack-config')
    ],
    customFields: {
        typedocsLocation: 'typedocs',
        gitlabDocsUrl: `${gitlabRepoUrl}/blob/${gitlabBranch}/packages/docs`
    }
};
