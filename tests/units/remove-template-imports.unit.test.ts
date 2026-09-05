import { expect, test } from 'vitest';

import { removeTemplateImports } from '../../src/vite/transformers/remove-template-imports';
import { fromSvelte, svelte } from '../test-utils';

test('should skip if no template import is detected', () => {
	const code = svelte`
		<script>
			import { onMount } from 'svelte';
		</script>
	`;
	const input = fromSvelte(code);
	const templates = removeTemplateImports(input);
	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(code);
	expect(templates).toEqual([]);
});

test('should remove template import from module script', () => {
	const input = fromSvelte(svelte`
		<script module>
			import { markdown } from 'svelte-md-template';
		</script>
	`);
	const templates = removeTemplateImports(input);

	const expected = svelte`<script module></script>`;
	const actual = input.s.toString();
	expect(actual).toBeIgnoringNewlineAndIndentation(expected);
	expect(templates).toEqual(['markdown']);
});

test('should remove template import from instance script', () => {
	const input = fromSvelte(svelte`
		<script>
			import { markdown } from 'svelte-md-template';
		</script>
	`);
	const templates = removeTemplateImports(input);

	const expected = svelte`<script></script>`;
	const actual = input.s.toString();
	expect(actual).toBeIgnoringNewlineAndIndentation(expected);
	expect(templates).toEqual(['markdown']);
});

test('should detect import alias', () => {
	const input = fromSvelte(svelte`
		<script>
			import { markdown as md } from 'svelte-md-template';
		</script>
	`);
	const templates = removeTemplateImports(input);

	const expected = svelte`<script></script>`;
	const actual = input.s.toString();
	expect(actual).toBeIgnoringNewlineAndIndentation(expected);
	expect(templates).toEqual(['md']);
});

