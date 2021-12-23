const path = require('path');

module.exports = {
    icon: true,
    ext: 'tsx',
    fileNameCase: 'kebab',
    svgProps: {
        fill: 'currentColor'
    },
    prettierConfig: {
        parser: 'typescript'
    },
    indexTemplate: function (filePaths) {
        const exportEntries = filePaths.map((filePath) => {
            const basename = path.basename(filePath, path.extname(filePath));
            return `export * from './${basename}'`;
        });
        return exportEntries.join('\n');
    },
    template: function ({ imports, componentName, props, jsx, exports }, { tpl }) {
        const iconName = `${componentName.replace('Svg', '')}Icon`;
        const iconComponent = `export const ${iconName} = (props: any) => (
            <Icon component={${componentName}} {...props} />
        );`;

        let output = tpl`
            import React from 'react';
            import Icon from '@ant-design/icons';

            export const ${componentName} = (props: React.SVGProps<SVGSVGElement>) => (
                ${jsx}
            );

            ${iconComponent}

        `;

        return output;
    }
};
