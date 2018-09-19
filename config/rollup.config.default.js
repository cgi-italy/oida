import typescript from 'rollup-plugin-typescript2';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json'

const pkg = require('./package.json')

let format = 'es';
if (process.env.FORMAT === 'cjs') {
    format = 'cjs';
}

let externalDependencies = Object.keys(pkg.peerDependencies || {});
let plugins = [
    typescript({
        typescript: require('typescript'),
        useTsconfigDeclarationDir: true
    })
];

let outputFile;

if (format === 'cjs') {
    plugins = [
        json({}),
        nodeResolve({
        }),
        commonjs({
        }),
        ...plugins
    ];
    outputFile = pkg.main;
} else {
    externalDependencies = [...externalDependencies, ...Object.keys(pkg.dependencies || {})];
    outputFile = pkg.module;
}

const externalsRegex = externalDependencies.map((dep) => {
    return new RegExp(`^${dep}([\\\/\\\\].+)?$`);
});


export default {
    input: 'src/index.ts',
    output: [
		{file: outputFile, format: format, sourcemap: true},
    ],
    external: (id, parent, isResolved) => {
        return externalsRegex.find((regex) => {
            return regex.test(id);
        });
    },
	plugins: plugins
}
