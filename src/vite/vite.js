/* eslint-disable jsdoc/reject-any-type */

import { MagicString } from 'magic-string';
import { parse } from 'svelte/compiler';

import { removeTemplateImports } from './transformers/remove-template-imports.js';
import { transformMarkdown } from './transformers/transform-markdown.js';

/**
 * @param {import('./types.public').SvelteMdTemplateOptions} [options]
 * @returns {Promise<import('vite').Plugin>}
 */
export async function svelteMdTemplate(options) {
	const templateSource = 'svelte-md-template';

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

				const templates = removeTemplateImports({ s, ast, templateSource });

				/** @type {import('./transformers/transform-markdown').TransformMarkdownInput['transform']} */
				let transform;
				if (options?.transformer?.type === 'custom') {
					transform = options.transformer.transform;
				} else {
					/** @type {any} */
					let processor = (await import('unified'))
						.unified()
						.use((await import('remark-parse')).default);
					let newProcessor = options?.transformer?.processor?.(processor);
					if (newProcessor === processor || !newProcessor) {
						processor = processor
							.use((await import('remark-rehype')).default, { allowDangerousHtml: true })
							.use((await import('rehype-stringify')).default, { allowDangerousHtml: true });
					} else {
						processor = newProcessor;
					}
					transform = async (str) => (await processor.process(str)).toString();
				}

				await transformMarkdown({ s, ast, templates, transform });

				return {
					code: s.toString(),
					map: s.generateMap({ hires: 'boundary', includeContent: true }),
				};
			},
		},
	};
}
