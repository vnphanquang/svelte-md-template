# svelte-md-template

transform markdown to html in Svelte files via explicit [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates)

[![Open on npmx.dev](https://npmx.dev/api/registry/badge/version/svelte-md-template)][npmx]
[![Open on npmx.dev](https://npmx.dev/api/registry/badge/vulnerabilities/svelte-md-template)][npmx]
[![See on bundlephobia](https://npmx.dev/api/registry/badge/size/svelte-md-template)](https://bundlephobia.com/package/svelte-md-template)
[![See code coverage](https://codecov.io/github/vnphanquang/svelte-md-template/graph/badge.svg)](https://codecov.io/github/vnphanquang/svelte-md-template)
[![See license](https://npmx.dev/api/registry/badge/license/svelte-md-template)](https://github.com/vnphanquang/svelte-md-template/blob/main/LICENSE)

## Installation

With a package manager of choice:

```bash
pnpm add -D svelte-md-template
```

## Usage

Add the vite plugin:

```javascript
/// vite.config.js

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteMdTemplate } from 'svelte-md-template';

export default defineConfig({
	plugins: [
		svelteMdTemplate({/* options */}),
		svelte(), // or import('@sveltejs/kit/vite').sveltekit
	],
});
```

Write content within the `markdown` tagged template:

```svelte
<script>
	import { markdown } from 'svelte-md-template';

	const foo = 'bar';
</script>

{markdown`
# My Markdown Content

Variable can be injected as expected: ${foo}
All templates are merged, e.g. write [link-reference-definition] in one block and use in others.
`}

{markdown`
[link-reference-definition]: https://spec.commonmark.org/0.31.2/#link-reference-definition
`}
```

The intermediate Svelte code looks something like:

```svelte
<script>
	const foo = 'bar';
</script>

<h1>My Markdown Content</h1>
<p>Variable can be injected as expected: {foo}</p>
<p>
	All instances are merged, e.g. write
	<a href="https://spec.commonmark.org/0.31.2/#link-reference-definition">
		link-reference-definition
	</a>
	in one block and use in others.
</p>
```

## Why?

### Motivation

Popular Markdown-in-Svelte solutions (that i know of) often mixes Svelte and Markdown syntax at the top level. An example with [mdsvex] is:

```markdown
<script>
  import { Penguin } from '$lib/components';
</script>

# mdsvex

svelte in markdown

<Penguin walk={true} />
```

The same can be said with [vite-plugin-svelte-md]. Such strategies work well for simple use cases. However, as i use them more extensively,
especially for writing interative blog posts and documentation, some inconveniences start to surface:

1. Toolings degrade, e.g. format / lint / highlight, because i would need to decide whether to treat the buffer as Markdown **or** Svelte, neglecting support for the other.
2. There are compatibility issues with Svelte syntax. For exampe, see
   [vite-plugin-svelte-md > Svelte Compatibility](https://github.com/ota-meshi/vite-plugin-svelte-md#-svelte-compatibility),
   or [mdsvex > issue 550 (enhance-img)](https://github.com/pngwn/MDsveX/issues/550).
   As Svelte semantics evolve, maintaining compatibility may require significant effort.
3. Upstream transformer is locked-in (e.g. [unified] or [markdown-it]), and the library often
   implements more features where i don't need them, but not enough where i need so.

`svelte-md-template` is my _naive_ take on a more explicit, minimal, and customisable approach,
utilising as much standard constructs as possible, In a way, it reverses the priority: Svelte-first, markdown as needed.
"Naive" because i may be ignorant to the implications this approach has in practice.

So far, it has served me well:

1. good tooling support: `markdown` tagged templates are often automatically picked up for syntax-highligting / formatting,
   or can be specified so in LSP / formatter settings.
   See [Recommended Prettier Config](#recommended-prettier-config) for an example;
2. minimal processing: the package footprint is quite small, as it doesn't have to maintain custom AST or complex parsing.
   Theoretically, fewer compatibility issues should arise, if at all.

> [!NOTE]
> Disclaimer: small footprint does not necessarily means more optimised. I have not done any
> benchmark against other tools.

Of course, no solution is without tradeoffs. See [Tradeoffs & Caveats](#tradeoffs-caveats) for more information.

### When to **not** Use This?

When content only relies on basic syntax, e.g. [CommonMark Specs](https://spec.commonmark.org/), with little or no Svelte code,
i recommend sticking to [mdsvex] or [vite-plugin-svelte-md] until you have an exact need that this package solves.

## Transformer

Markdown-to-HTML transformation may be customised using the `transformer` option

```typescript
import { svelteMdTemplate } from 'svelte-md-template';

/// -------- Example --------
svelteMdTemplate({
	transformer: {/** see below */},
});

/// -------- API --------
import type { Root } from 'mdast';
import type { PluggableList, Processor } from 'unified';

interface SvelteMdTemplateOptions {
	transformer?: SvelteMdTemplateTransformer;
}

type SvelteMdTemplateTransformer =
	| SvelteMdTemplateTransformerUnifiedWithPlugins
	| SvelteMdTemplateTransformerUnified
	| SvelteMdTemplateTransformerCustom;

export type SvelteMdTemplateTransformerUnifiedWithPlugins = {
	type: 'unified';
	remarkPlugins?: PluggableList;
	rehypePlugins?: PluggableList;
};
export type SvelteMdTemplateTransformerUnified = {
	type: 'unified';
	processor: Processor<Root, any, any, any, any>;
};
export type SvelteMdTemplateTransformerCustom = {
	type: 'custom';
	transform: (input: {
		/** array of markdown content as they appear from the original Svelte file in tagged templates */
		templates: string[];
		/** `id` from vite transform handler, often the path to current file, unless is a virtual file */
		id?: string;
	}) => string[] | Promise<string[]>;
};
```

### [unified]

By default, `svelteMdTemplate` uses a minimal [remark]-[rehype] processor:

```javascript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const processor = unified()
	.use(remarkParse)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeStringify, { allowDangerousHtml: true });
```

The processor is permissive, i.e `allowDangerousHtml`, for convenience. Security may not be a major concern here since
markdown content **_should_** be static at build time.

Some customisation recipes are listed in the next sub-sections.

#### Extending the Default

Additional [remark] & [rehype] plugins can be added:

```typescript
import { svelteMdTemplate } from 'svelte-md-template';

svelteMdTemplate({
	transformer: {
		type: 'unified',
		remarkPlugins: [/* ... */],
		rehypePlugins: [/* ... */],
	},
});
```

There is a `definePlugin` helper to provide typescript support for plugin options:

```typescript
import { svelteMdTemplate } from 'svelte-md-template';
import { definePlugin } from 'svelte-md-template/unified';
import remarkEnhanceCodeblock from 'remark-enhance-codeblock';

svelteMdTemplate({
	transformer: {
		type: 'unified',
		remarkPlugins: [definePlugin(remarkEnhanceCodeblock, {/* typing is inferred */})],
	},
});
```

#### Providing a Custom unified Processor

A completely custom [unified] pipeline can be specified. This may be helpful to use a preset, pin specific versions,
or when advanced options are necessary.

```typescript
import { svelteMdTemplate } from 'svelte-md-template';
import { unified } from 'unified';

svelteMdTemplate({
	transformer: {
		type: 'unified',
		processor: unified().use(/* ... */), // specify a preset, for example
	},
});
```

### Bring-Your-Own Transformer

If a use case calls for a strategy other than [unified], e.g [markdown-it], provide a custom transformer:

```typescript
import { svelteMdTemplate } from 'svelte-md-template';
import MarkdownIt from 'markdown-it';

svelteMdTemplate({
	transformer: {
		type: 'custom',
		transform: function ({ templates }) {
			const delimiter = '<!-- SVELTE_MD -->';
			const merged = templates.join(`\n\n${delimiter}\n\n`);
			const md = new MarkdownIt({ html: true });
			const transformed = md.render(merged);
			return transformed.split(delimiter);
		},
	},
});
```

Note that, the `transform` function:

- takes an array of strings via the `templates` property, each corresponding to a `` markdown`...` ``
  template instance in the original Svelte file, and,
- is expected to return an array of strings matching the aforementioned order.

## Including / Excluding Files

By default, `svelteMdTemplate` should pick up the same files to-be-processed by `svelte` / `sveltekit`.
In the event it is necessary to explicitly define what to / not to process, specify `include` / `exclude`:

```typescript
import { svelteMdTemplate } from 'svelte-md-template';

/// -------- Example --------
svelteMdTemplate({
	include: /\.md.svelte$/,
	exclude: /\.no-md\.svelte$/,
});

/// -------- API --------
type FilterIdSpecs = (string | RegExp)[] | string | RegExp;
interface SvelteMdTemplateOptions {
	include?: FilterIdSpecs;
	exclude?: FilterIdSpecs;
}
```

## Package Alias

The tag imports are stripped during the process, i.e:

```svelte
<script>
	import { markdown } from 'svelte-md-template'; // <!-- to be removed automatically -->
</script>
```

When the package, i.e. `svelte-md-template`, is aliased to something else, this may not work as expected.
In such case, specify `importSource`:

```typescript
import { svelteMdTemplate } from 'svelte-md-template';
import MarkdownIt from 'markdown-it';

svelteMdTemplate({
	importSource: 'alias-for-svelte-md-package',
});
```

## Recommended Prettier Config

Make sure necessary prettier plugins are installed:

```bash
pnpm add -D prettier-plugin-embed prettier-plugin-svelte
```

Configure prettier to format Markdown code inside Svelte files:

```js
/// prettier.config.js

/** @type {import('prettier').Config} */
export default {
	/* your regular options here */
	plugins: ['prettier-plugin-embed', 'prettier-plugin-svelte'],
	overrides: [
		{
			files: '**/*.svelte',
			options: /** @satisfies {import('prettier-plugin-embed').PrettierPluginEmbedOptions} */ ({
				embeddedMarkdownTags: ['markdown'],
				noEmbeddedMultiLineIndentation: ['markdown'],
			}),
		},
	],
};
```

If using an alias for the `markdown` template, adjust accordingly.

> [!NOTE]
> `noEmbeddedMultiLineIndentation` is to avoid indenting the code inside `` markdown`...` ``, which will be mistakenly picked up by syntax-highlight tooling as an indented code block.

## Tradeoffs & Caveats

> [!NOTE]
> The usage is, by design, explicit and verbose.

### Escaping Backticks

The most common inconvenience is that backtick has to be escaped:

```svelte
{markdown`
Backticks, e.g. \`inline code\`, need to be escaped
`}
```

For code blocks, use tidle, i.e `~`, to avoid so:

```svelte
{markdown`
~~~javascript
console.log('Hello, world!');
~~~
`}
```

Alternatively, content containing a lot of backticks can be written in some variable / other file and loaded in as needed.
For example, using [remark-codeblock-source](https://github.com/vnphanquang/remark-codeblock-source) to write code example in separate file:

```svelte
{markdown`
~~~javascript src="fs:./examples/hello.js"

~~~
`}

{markdown`
~~~language src="github:account/:repo/:commit_or_branch/:filepath"

~~~
`}
```

### Escaping Expressions

`${...}` is picked up as expected. For example, this input:

```svelte
<script>
	const foo = 'bar';
</script>

{markdown`
foo is ${foo}
`}
```

...will be transformed to:

```svelte
<script>
	const foo = 'bar';
</script>

<p>foo is {foo}</p>
```

If `${...}` is meant to be rendered as is, escape as `\${...}`.

Similarly `{...}` will be escaped by default, otherwise it would be picked up as Svelte expression in the output. For example, this input:

```svelte
{markdown`
{static} is not an expression
`}
```

...will be be transformed to:

```svelte
<p>&lbrace;static} is not an expression</p>
```

## Related Projects / Prior Arts

- [mdsvex]
- [vite-plugin-svelte-md]

Some [remark] plugins I wrote that may be helpful:

- [remark-enhance-codeblock](https://github.com/vnphanquang/remark-enhance-codeblock)
- [remark-transform-blockquote](https://github.com/vnphanquang/remark-transform-blockquote)
- [remark-codeblock-source](https://github.com/vnphanquang/remark-codeblock-source)

## CONTRIBUTING

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

---

[built by human, not agents](https://gist.github.com/vnphanquang/018ee2b2080c9dc9890327f3d233998b).

[npmx]: https://npmx.dev/package/svelte-md-template
[markdown-it]: https://github.com/markdown-it/markdown-it
[unified]: https://github.com/unifiedjs/unified
[remark]: https://github.com/remarkjs/remark
[rehype]: https://github.com/rehypejs/rehype
[mdsvex]: https://github.com/pngwn/mdsvex
[vite-plugin-svelte-md]: https://github.com/ota-meshi/vite-plugin-svelte-md
