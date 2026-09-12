import fs from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, test } from 'vitest';

import {
	createUnifiedTransform,
	transformMarkdown,
} from '../../src/vite/transformers/transform-markdown';
import { createMinimalProcessor, fromSvelte, svelte } from '../test-utils';

const transform = createUnifiedTransform(createMinimalProcessor());
const tags = ['markdown'];
const id = 'input.svelte';

test('can transform markdown from tagged template expression', async () => {
	const code = svelte`
	<script>
	  import { markdown } from 'svelte-md-template';
	</script>

	{markdown\`# Example\`}
	`;

	const input = fromSvelte(code);
	await transformMarkdown({ ...input, tags, transform, id });

	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(svelte`
	<script>
	  import { markdown } from 'svelte-md-template';
	</script>

	<h1>Example</h1>
	`);
});

test('can preserve position', async () => {
	const code = svelte`
	<script>
	  import { markdown } from 'svelte-md-template';
	</script>

	{markdown\`## Section 1\`}

	<SvelteComponent />

	{markdown\`## Section 2\`}
	`;

	const input = fromSvelte(code);
	await transformMarkdown({ ...input, tags, transform, id });

	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(svelte`
	<script>
	  import { markdown } from 'svelte-md-template';
	</script>
	<h2>Section 1</h2>
	<SvelteComponent />
	<h2>Section 2</h2>
	`);
});

test('can reference each other', async () => {
	const code = svelte`
	<script>
	  import { markdown } from 'svelte-md-template';
	</script>

	{markdown\`[codeberg]\`}

	<SvelteComponent />

	{markdown\`
	[codeberg]: https://codeberg.org/
	\`}
	`;

	const input = fromSvelte(code);
	await transformMarkdown({ ...input, tags, transform, id });

	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(svelte`
	<script>
	  import { markdown } from 'svelte-md-template';
	</script>
	<p><a href="https://codeberg.org/">codeberg</a></p>
	<SvelteComponent />
	`);
});

test('shoud skip empty input', async () => {
	const input = fromSvelte('');
	await transformMarkdown({ ...input, tags, transform, id });
	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation('');
});

test('shoud skip expression tags that are not tagged template', async () => {
	const code = svelte`<p>{'Should skip'}</p>`;
	const input = fromSvelte(code);
	await transformMarkdown({ ...input, tags, transform, id });
	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(code);
});

test('shoud skip tagged template expression that does not match template names', async () => {
	const code = svelte`<p>{sql\`SELECT * FROM users\`}</p>`;
	const input = fromSvelte(code);
	await transformMarkdown({ ...input, tags, transform, id });
	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(code);
});

test('should remove $ from expressions', async () => {
	const code = svelte`
		<script>
			import { markdown } from 'svelte-md-template';
			const foo = 'bar';
		</script>

		{markdown\`# Use \${foo} variable\`}
	`;
	const input = fromSvelte(code);
	await transformMarkdown({ ...input, tags, transform, id });
	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(svelte`
	<script>
	  import { markdown } from 'svelte-md-template';
		const foo = 'bar';
	</script>
	<h1>Use {foo} variable</h1>
	`);
});

describe('should escape curly brace', () => {
	test('from original source', async () => {
		const code = svelte`
		<script>
		import { markdown } from 'svelte-md-template';
		</script>

		{markdown\`
		{not-expression}, {another-not-expression}

		~~~
		console.log({ foo: 'bar' });
		~~~
		\`}
		`;
		const input = fromSvelte(code);
		await transformMarkdown({ ...input, tags, transform, id });
		expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(svelte`
		<script>
		import { markdown } from 'svelte-md-template';
		</script>
		<p>&lbrace;not-expression}, &lbrace;another-not-expression}</p>
		<pre><code>console.log(&lbrace; foo: 'bar' });</code></pre>
		`);
	});

	test.todo('emerged after transform', async () => {

	})
});

test('should ignore escaped expression', async () => {
	const code = await fs.readFile(
		path.resolve(import.meta.dirname, './fixtures/ignore-escaped-expression.input.svelte'),
		'utf-8',
	);
	const input = fromSvelte(code);
	await transformMarkdown({ ...input, tags, transform, id });
	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(svelte`
	<script>
	  import { markdown } from 'svelte-md-template';
	</script>
	<pre><code>console.log('foo: $&lbrace;bar}')</code></pre>
	`);
});

test('should preserve expression in code elements', async () => {
	const code = await fs.readFile(
		path.resolve(import.meta.dirname, './fixtures/expression-in-code.input.svelte'),
		'utf-8',
	);
	const input = fromSvelte(code);
	await transformMarkdown({ ...input, tags, transform, id });
	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(svelte`
	<script>
	  import { markdown } from 'svelte-md-template';
	  const foo = 'bar';
	</script>
	<p>foo is: {foo}</p>
	<pre><code>foo is {foo}</code></pre>
	`);
});
