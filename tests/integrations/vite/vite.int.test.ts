import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { remarkEnhanceCodeblock } from 'remark-enhance-codeblock';
import { expect, test } from 'vitest';

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
	expect(formatted).toBe(expected);
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
				processor: (unified) => unified.use(remarkEnhanceCodeblock),
			},
		},
	);
	const formatted = await formatHtmlWithPrettier(built);
	const expected = await readFile(
		resolve(import.meta.dirname, './fixtures/remark-plugin/output.html'),
		'utf-8',
	);
	expect(formatted).toBe(expected);
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
				processor: () => createMinimalProcessor(),
			},
		},
	);
	const formatted = await formatHtmlWithPrettier(built);
	const expected = await readFile(
		resolve(import.meta.dirname, './fixtures/custom-unified/output.html'),
		'utf-8',
	);
	expect(formatted).toBe(expected);
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
				transform: () => '<h1>Custom Transformer</h1>',
			},
		},
	);
	const formatted = await formatHtmlWithPrettier(built);
	const expected = await readFile(
		resolve(import.meta.dirname, './fixtures/custom-transformer/output.html'),
		'utf-8',
	);
	expect(formatted).toBe(expected);
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
	expect(formatted).toBe(expected);
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
