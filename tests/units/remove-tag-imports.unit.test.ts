import { expect, test } from 'vitest';

import { removeTagImports } from '../../src/vite/transformers/remove-tag-imports';
import { fromSvelte, svelte } from '../test-utils';

test('should skip if no tag import is detected', () => {
	const code = svelte`
		<script>
			import { onMount } from 'svelte';
		</script>
	`;
	const input = fromSvelte(code);
	const tags = removeTagImports(input);
	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(code);
	expect(tags).toEqual([]);
});

test('should remove tag import from module script', () => {
	const input = fromSvelte(svelte`
		<script module>
			import { markdown } from 'svelte-md-template';
		</script>
	`);
	const tags = removeTagImports(input);

	const expected = svelte`<script module></script>`;
	const actual = input.s.toString();
	expect(actual).toBeIgnoringNewlineAndIndentation(expected);
	expect(tags).toEqual(['markdown']);
});

test('should remove tag import from instance script', () => {
	const input = fromSvelte(svelte`
		<script>
			import { markdown } from 'svelte-md-template';
		</script>
	`);
	const tags = removeTagImports(input);

	const expected = svelte`<script></script>`;
	const actual = input.s.toString();
	expect(actual).toBeIgnoringNewlineAndIndentation(expected);
	expect(tags).toEqual(['markdown']);
});

test('should detect import alias', () => {
	const input = fromSvelte(svelte`
		<script>
			import { markdown as md } from 'svelte-md-template';
		</script>
	`);
	const tags = removeTagImports(input);

	const expected = svelte`<script></script>`;
	const actual = input.s.toString();
	expect(actual).toBeIgnoringNewlineAndIndentation(expected);
	expect(tags).toEqual(['md']);
});

test('should detect import from literal', () => {
	const input = fromSvelte(svelte`
		<script>
			import { 'markdown' as markdown } from 'svelte-md-template';
		</script>
	`);
	const tags = removeTagImports(input);

	const expected = svelte`<script></script>`;
	const actual = input.s.toString();
	expect(actual).toBeIgnoringNewlineAndIndentation(expected);
	expect(tags).toEqual(['markdown']);
});

test('should detect multiple imports ', () => {
	const input = fromSvelte(svelte`
		<script>
			import { 'markdown' as markdown, markdown as md } from 'svelte-md-template';
		</script>
	`);
	const tags = removeTagImports(input);

	const expected = svelte`<script></script>`;
	const actual = input.s.toString();
	expect(actual).toBeIgnoringNewlineAndIndentation(expected);
	expect(tags).toEqual(['markdown', 'md']);
});

test('should keep import statement if there is irrelevant specifier', () => {
	const input = fromSvelte(svelte`
		<script>
			import { markdown, SomeOther, 'markdown' as md } from 'svelte-md-template';
		</script>
	`);
	const tags = removeTagImports(input);

	const expected = svelte`<script>
		import {  SomeOther,  } from 'svelte-md-template';
	</script>`;
	const actual = input.s.toString();
	expect(actual).toBeIgnoringNewlineAndIndentation(expected);
	expect(tags).toEqual(['markdown', 'md']);
});

test('should skip imports that are not specifier', () => {
	const input = fromSvelte(svelte`
		<script>
			import defaultImport from 'svelte-md-template';
			import * as namespaceImport from 'svelte-md-template';
		</script>
	`);
	const tags = removeTagImports(input);

	const expected = svelte`<script>
		import defaultImport from 'svelte-md-template';
		import * as namespaceImport from 'svelte-md-template';
	</script>`;
	const actual = input.s.toString();
	expect(actual).toBeIgnoringNewlineAndIndentation(expected);
	expect(tags).toEqual([]);
});
