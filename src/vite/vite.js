/* eslint-disable jsdoc/reject-any-type */

import { MagicString } from 'magic-string';
import { parse } from 'svelte/compiler';

import { removeTagImports } from './transformers/remove-tag-imports.js';
import { createUnifiedTransform, transformMarkdown } from './transformers/transform-markdown.js';

/**
 * @param {import('./types.public').SvelteMdTemplateOptions} [options]
 * @returns {Promise<import('vite').Plugin>}
 */
export async function svelteMdTemplate(options) {
	/** @type {import('./types.public').FilterIdSpecs | null} */
	let svelteIdFilter = null;
	return {
		name: 'vite-plugin-svelte-md-template',
		enforce: 'pre',
		configResolved(c) {
			svelteIdFilter = c.plugins.find((p) => p.name === 'vite-plugin-svelte:config')?.api?.filter
				.id;
		},
		transform: {
			/// reference: https://github.com/sveltejs/vite-plugin-svelte/blob/8d032b286f0e2374173258b9f1cbabc309fe0d3e/docs/advanced-usage.md#transform-svelte-files-with-vite-plugins
			order: 'pre',
			filter: {
				id: {
					include: options?.include || svelteIdFilter || /\.svelte$/,
					exclude: options?.exclude,
				},
			},
			async handler(code, id) {
				const s = new MagicString(code);
				const ast = parse(code, { modern: true, filename: id });

				const tags = removeTagImports({
					s,
					ast,
					importSource: options?.importSource ?? 'svelte-md-template',
				});

				/** @type {import('./transformers/transform-markdown').TransformMarkdownInput['transform']} */
				let transform;
				if (options?.transformer?.type === 'custom') {
					transform = options.transformer.transform;
				} else {
					/** @type {any} */
					let processor;
					if (options?.transformer && 'processor' in options.transformer) {
						processor = options.transformer.processor;
					} else {
						/** @type {import('unified').PluggableList} */
						let remarkPlugins = [];
						/** @type {import('unified').PluggableList} */
						let rehypePlugins = [];

						if (options?.transformer) {
							({ remarkPlugins = [], rehypePlugins = [] } =
								/** @type {import('./types.public').SvelteMdTemplateTransformerUnifiedWithPlugins} */ (
									options.transformer
								));
						}

						processor = (await import('unified'))
							.unified()
							.use((await import('remark-parse')).default)
							.use(remarkPlugins)
							.use((await import('remark-rehype')).default, { allowDangerousHtml: true })
							.use(rehypePlugins)
							.use((await import('rehype-stringify')).default, { allowDangerousHtml: true });
					}
					transform = createUnifiedTransform(processor);
				}

				await transformMarkdown({ s, ast, tags, transform, id });

				return {
					code: s.toString(),
					map: s.generateMap({ hires: 'boundary', includeContent: true }),
				};
			},
		},
	};
}
