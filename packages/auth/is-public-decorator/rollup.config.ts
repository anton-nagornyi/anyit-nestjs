import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
	{
		input: './index.ts',
		output: {
			dir: './dist',
			format: 'cjs',
			sourcemap: false
		},
		external: [
			'@nestjs/common',
		],
		plugins: [
			typescript({
				tsconfig: 'tsconfig.build.json',
				sourceMap: false
			}),
		],
	},
	{
		input: 'dist/@types/index.d.ts',
		output: [{ file: 'dist/index.d.ts', format: 'es' }],
		plugins: [dts()],
	},
];