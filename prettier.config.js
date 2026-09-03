/** @type {import('prettier').Config} */
export default {
	semi: true,
	useTabs: true,
	singleQuote: true,
	trailingComma: 'all',
	printWidth: 100,
	plugins: ['prettier-plugin-embed', 'prettier-plugin-svelte'],
	overrides: [
		{ files: '**/*.yaml', options: { proseWrap: 'always' } },
		{
			files: '**/*.svelte',
			options: /** @type {import('prettier-plugin-embed').PrettierPluginEmbedOptions} */ ({
				embeddedMarkdownTags: ['markdown'],
				noEmbeddedMultiLineIndentation: ['markdown'],
			}),
		},
	],
};
