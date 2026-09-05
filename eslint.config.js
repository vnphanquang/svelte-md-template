import { fileURLToPath } from 'node:url';

import { defineConfig } from '@vnphanquang/eslint-config';
import { globalIgnores } from 'eslint/config';
import { jsdoc } from 'eslint-plugin-jsdoc';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

const jsdocConfig = [
	jsdoc({
		files: ['src/**/*.js'],
		config: 'flat/recommended-typescript-flavor',
		rules: {
			'jsdoc/require-returns-description': 'off',
			'jsdoc/require-param-description': 'off',
			'jsdoc/require-property-description': 'off',
			'jsdoc/require-jsdoc': [
				'warn',
				{
					publicOnly: {
						ancestorsOnly: true,
					},
				},
			],
			'jsdoc/tag-lines': 'off',
		},
	}),
];

export default await defineConfig(
	{},
	globalIgnores([gitignorePath, 'coverage/**/*.js', '**/dist/**/*.js', 'types/**/*']),
	jsdocConfig,
	{
		files: ['**/*.js'],
		rules: {
			'import-x/extensions': [
				'error',
				'always',
				{
					js: 'always',
					ignorePackages: true,
					fix: true,
				},
			],
		},
	},
);
