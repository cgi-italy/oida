import common from '../../config/rollup.config.default';

import copy from 'rollup-plugin-copy-glob';

const pkg = require('./package.json');

export default {
    ...common,
    plugins: [
        ...common.plugins,
        copy([
            {files: 'styles/**/*.scss', dest: 'dist/styles'}
        ])
    ]
};

