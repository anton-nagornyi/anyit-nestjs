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
			'@nestjs/graphql',
			'@nestjs/apollo',
			'@apollo/server/plugin/landingPage/default',
			'@apollo/server/plugin/inlineTrace',
			'@apollo/server/plugin/disabled'
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