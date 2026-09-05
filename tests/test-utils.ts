/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolve } from 'node:path';

import dedent from 'dedent';
import { MagicString } from 'magic-string';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { parse } from 'svelte/compiler';
import { unified } from 'unified';
import { vi } from 'vitest';

import prettierConfig from '../prettier.config.js';
import type { SvelteMdTemplateOptions } from '../src/vite';
import { svelteMdTemplate } from '../src/vite/vite.js';

export const markdown = dedent;
export const svelte = dedent.withOptions({ trimWhitespace: true, alignValues: false });
export const html = dedent.withOptions({ trimWhitespace: true });

export function fromSvelte(svelte: string) {
	const s = new MagicString(svelte);
	const ast = parse(svelte, { modern: true });
	return { s, ast };
}

export async function formatHtmlWithPrettier(input: string) {
	return (await import('prettier')).format(input, { ...prettierConfig, parser: 'html' });
}

export async function buildWithVite(
	context: {
		root: string;
		input: string;
	},
	options?: SvelteMdTemplateOptions,
) {
	const { build, defineConfig } = await import('vite');
	const { svelte } = await import('@sveltejs/vite-plugin-svelte');
	const { render } = await import('svelte/server');
	await build(
		defineConfig({
			logLevel: 'silent',
			root: context.root,
			plugins: [
				svelteMdTemplate(options),
				svelte({
					extensions: ['md', 'svelte'],
					compilerOptions: {
						modernAst: true,
					},
				}),
			],
			build: {
				ssr: true,
				rolldownOptions: {
					input: context.input,
					// externalise svelte, otherwise will conflict with the imports from this file
					external: [/^svelte(\/.*)?$/],
					output: {
						entryFileNames: 'index.js',
					},
				},
			},
		}),
	);
	const actual = await vi.importActual<any>(resolve(context.root, './dist/index.js'));
	const { body } = render(actual.default);
	return body;
}

export function createMinimalProcessor() {
	return unified()
		.use(remarkParse)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeStringify, { allowDangerousHtml: true });
}
