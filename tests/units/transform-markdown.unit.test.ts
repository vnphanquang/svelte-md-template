import { expect, test } from 'vitest';

import { transformMarkdown } from '../../src/vite/transformers/transform-markdown';
import { createMinimalProcessor, fromSvelte, svelte } from '../test-utils';

async function transform(code: string) {
	const processor = createMinimalProcessor();
	return (await processor.process(code)).toString();
}
const templates = ['markdown'];

test('can transform markdown from tagged template expression', async () => {
	const code = svelte`
	<script>
	  import { markdown } from 'svelte-md-template';
	</script>

	{markdown\`# Example\`}
	`;

	const input = fromSvelte(code);
	await transformMarkdown({ ...input, templates, transform });

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
	await transformMarkdown({ ...input, templates, transform });

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
	await transformMarkdown({ ...input, templates, transform });

	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(svelte`
	<script>
	  import { markdown } from 'svelte-md-template';
	</script>
	<p><a href="https://codeberg.org/">codeberg</a></p>
	<SvelteComponent />
	`);
});

test('shoud skip expression tags that are not tagged template', async () => {
	const code = svelte`<p>{'Should skip'}</p>`;
	const input = fromSvelte(code);
	await transformMarkdown({ ...input, templates, transform });
	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(code);
});

test('shoud skip tagged template expression that does not match template names', async () => {
	const code = svelte`<p>{sql\`SELECT * FROM users\`}</p>`;
	const input = fromSvelte(code);
	await transformMarkdown({ ...input, templates, transform });
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
	await transformMarkdown({ ...input, templates, transform });
	expect(input.s.toString()).toBeIgnoringNewlineAndIndentation(svelte`
	<script>
	  import { markdown } from 'svelte-md-template';
		const foo = 'bar';
	</script>
	<h1>Use {foo} variable</h1>
	`);
});
