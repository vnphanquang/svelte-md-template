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
