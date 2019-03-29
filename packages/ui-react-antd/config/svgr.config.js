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
    template: function({ template }, opts, { imports, componentName, props, jsx, exports }) {

        const typeScriptTpl = template.smart({ plugins: ['typescript'] });

        const iconName = `${componentName.name.replace('Svg', '')}Icon`;
        const iconComponent = `export const ${iconName} = (props: any) => (<Icon component={${componentName.name}} {...props} />);`;

        let output =  typeScriptTpl.ast`
            import React from 'react';
            import { Icon } from 'antd';

            export const ${componentName} = (props: React.SVGProps<SVGSVGElement>) => ${jsx};

            ${iconComponent}
        `

        return output;
    }
}
