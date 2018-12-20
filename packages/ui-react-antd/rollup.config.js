import common from '../../config/rollup.config.default';

import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy-glob';

const pkg = require('./package.json');

export default {
    ...common,
    plugins: [
        ...common.plugins,
        postcss({
            extract: pkg.style,
            sourceMap: true
        }),
        copy([
            {files: 'src/**/*.scss', dest: 'dist/styles'}
        ])
    ]
};

