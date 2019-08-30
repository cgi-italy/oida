import common from '../../config/rollup.config.default';

import copy from 'rollup-plugin-copy-glob';

export default {
    ...common,
    plugins: [
        ...common.plugins,
        copy([
            {files: 'src/**/*.scss', dest: 'dist/styles'}
        ])
    ]
};

