const path = require('path');

module.exports = {
    icon: true,
    ext: "tsx",
    fileNameCase: 'kebab',
    svgProps: {
        'fill': 'currentColor'
    },
    prettierConfig: {
        singleQuote: true,
        jsxSingleQuote: true
    },
    indexTemplate: function(filePaths) {
        const exportEntries = filePaths.map((filePath) => {
            const basename = path.basename(filePath, path.extname(filePath))
            return `export * from './${basename}'`
        });
        return exportEntries.join('\n');
    },
    template: function({ template }, opts, { imports, componentName, props, jsx, exports }) {

        const typeScriptTpl = template.smart({ plugins: ['typescript'] });

        const iconName = `${componentName.name.replace('Svg', '')}Icon`;
        const iconComponent = `export const ${iconName} = (props: any) => (<Icon component={${componentName.name}} {...props} />);`;

        let output =  typeScriptTpl.ast`
            import React from 'react';
            import Icon from '@ant-design/icons';;

            export const ${componentName} = (props: React.SVGProps<SVGSVGElement>) => ${jsx};

            ${iconComponent}
        `

        return output;
    }
}
