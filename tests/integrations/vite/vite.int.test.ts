import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// eslint-disable-next-line import-x/no-named-as-default
import MarkdownIt from 'markdown-it';
import rehypeDocument from 'rehype-document';
import remarkEnhanceCodeblock from 'remark-enhance-codeblock';
import { expect, test } from 'vitest';

import { definePlugin } from '../../../src/unified';
import { buildWithVite, createMinimalProcessor, formatHtmlWithPrettier } from '../../test-utils';

test('can transform typical Common-Mark syntax', async () => {
	// reference: https://spec.commonmark.org
	const built = await buildWithVite({
		root: resolve(import.meta.dirname, './fixtures/common-mark'),
		input: resolve(import.meta.dirname, './fixtures/common-mark/input.svelte'),
	});
	const formatted = await formatHtmlWithPrettier(built);
	const expected = await readFile(
		resolve(import.meta.dirname, './fixtures/common-mark/output.html'),
		'utf-8',
	);
	expect(formatted).toBeIgnoringNewlineAndIndentation(expected);
});

test('can add remark plugin', async () => {
	const built = await buildWithVite(
		{
			root: resolve(import.meta.dirname, './fixtures/remark-plugin'),
			input: resolve(import.meta.dirname, './fixtures/remark-plugin/input.svelte'),
		},
		{
			transformer: {
				type: 'unified',
				remarkPlugins: [definePlugin(remarkEnhanceCodeblock)],
			},
		},
	);
	const formatted = await formatHtmlWithPrettier(built);
	const expected = await readFile(
		resolve(import.meta.dirname, './fixtures/remark-plugin/output.html'),
		'utf-8',
	);
	expect(formatted).toBeIgnoringNewlineAndIndentation(expected);
});

test('can add rehype plugin', async () => {
	const built = await buildWithVite(
		{
			root: resolve(import.meta.dirname, './fixtures/rehype-plugin'),
			input: resolve(import.meta.dirname, './fixtures/rehype-plugin/input.svelte'),
		},
		{
			transformer: {
				type: 'unified',
				rehypePlugins: [definePlugin(rehypeDocument, { language: 'vi' })],
			},
		},
	);
	const formatted = await formatHtmlWithPrettier(built);
	const expected = await readFile(
		resolve(import.meta.dirname, './fixtures/rehype-plugin/output.html'),
		'utf-8',
	);
	expect(formatted).toBeIgnoringNewlineAndIndentation(expected);
});

test('can override unified processor', async () => {
	const built = await buildWithVite(
		{
			root: resolve(import.meta.dirname, './fixtures/custom-unified'),
			input: resolve(import.meta.dirname, './fixtures/custom-unified/input.svelte'),
		},
		{
			transformer: {
				type: 'unified',
				processor: createMinimalProcessor(),
			},
		},
	);
	const formatted = await formatHtmlWithPrettier(built);
	const expected = await readFile(
		resolve(import.meta.dirname, './fixtures/custom-unified/output.html'),
		'utf-8',
	);
	expect(formatted).toBeIgnoringNewlineAndIndentation(expected);
});

test('can use custom transformer', async () => {
	const built = await buildWithVite(
		{
			root: resolve(import.meta.dirname, './fixtures/custom-transformer'),
			input: resolve(import.meta.dirname, './fixtures/custom-transformer/input.svelte'),
		},
		{
			transformer: {
				type: 'custom',
				transform: function (templates: string[]) {
					const delimiter = '<!-- SVELTE_MD -->';
					const merged = templates.join(`\n\n${delimiter}\n\n`);
					const md = new MarkdownIt({ html: true });
					const transformed = md.render(merged);
					return transformed.split(delimiter);
				},
			},
		},
	);
	const formatted = await formatHtmlWithPrettier(built);
	const expected = await readFile(
		resolve(import.meta.dirname, './fixtures/custom-transformer/output.html'),
		'utf-8',
	);
	expect(formatted).toBeIgnoringNewlineAndIndentation(expected);
});

test('can specify custom include', async () => {
	const built = await buildWithVite(
		{
			root: resolve(import.meta.dirname, './fixtures/custom-include'),
			input: resolve(import.meta.dirname, './fixtures/custom-include/input.md'),
		},
		{
			include: /\.md$/,
		},
	);
	const formatted = await formatHtmlWithPrettier(built);
	const expected = await readFile(
		resolve(import.meta.dirname, './fixtures/custom-include/output.html'),
		'utf-8',
	);
	expect(formatted).toBeIgnoringNewlineAndIndentation(expected);
});

test('can specify custom exclude', async () => {
	await expect(
		buildWithVite(
			{
				root: resolve(import.meta.dirname, './fixtures/custom-exclude'),
				input: resolve(import.meta.dirname, './fixtures/custom-exclude/input.md'),
			},
			{
				exclude: /\.md$/,
			},
		),
	).rejects.toThrow(
		'This markdown template was not processed at build time. Make sure the vite plugin is set up correctly.',
	);
});

test('can escape properly', async () => {
	const built = await buildWithVite({
		root: resolve(import.meta.dirname, './fixtures/escapes'),
		input: resolve(import.meta.dirname, './fixtures/escapes/input.svelte'),
	});
	const formatted = await formatHtmlWithPrettier(built);
	const expected = await readFile(
		resolve(import.meta.dirname, './fixtures/escapes/output.html'),
		'utf-8',
	);
	expect(formatted).toBeIgnoringNewlineAndIndentation(expected);
});
