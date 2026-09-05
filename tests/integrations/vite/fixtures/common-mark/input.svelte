<script>
	import { markdown } from 'svelte-md-template';
</script>

{markdown`
# CommonMark 0.31.2 Feature Showcase

## Leaf Blocks

### Thematic Breaks

---

### Headings

ATX Headings:

# H1

## H2

### H3

#### H4

##### H5

###### H6

Setext Headings
===============

Secondary Setext
----------------

### Indented Code Blocks

This is an indented code block.
It requires 4 spaces of indentation.

### Fenced Code Blocks

~~~html
<div>Fenced code block using backtick or tildes</div>
~~~

### HTML Blocks

<div class="custom-block">
<p>This is a raw HTML block recognized by CommonMark.</p>
</div>

### Paragraphs and Blank Lines

This is a standard paragraph. Blank lines separate consecutive paragraphs and other block-level elements.

This is a new paragraph.

---

## Container Blocks

### Blockquotes

> This is a blockquote.
>
> > Nested blockquotes are also supported.
>
> You can have multiple paragraphs inside them.

### Lists

Unordered Lists (can use \`*\`, \`-\`, or \`+\`):

- Item 1
- Item 2

* Subitem A

- Subitem B

Ordered Lists (can use \`.\` or \`)\`):

1. First item
2. Second item

1)  Sub-list using right parenthesis
2)  Another sub-list item

---

## Inlines

### Code Spans

Use \`\` \`backticks\` \`\` to denote inline code. You can use \`multiple backticks\` to wrap code containing a single backtick like \`\` \` \`\`.

### Emphasis and Strong Emphasis

_Emphasis using asterisks_ or _emphasis using underscores_.
**Strong emphasis using asterisks** or **strong emphasis using underscores**.
_**Strong emphasis**_ can be combined.

### Links

[Inline link](https://commonmark.org 'CommonMark Title')
[Full Reference link][ref]
[Shortcut Reference link]

[ref]: https://spec.commonmark.org/0.31.2 'CommonMark Spec'
[Shortcut Reference link]: https://commonmark.org

### Images

![Alt text for image](https://commonmark.org/help/images/favicon.png 'Image Title')
[![Linked Image](https://commonmark.org/help/images/favicon.png)](https://commonmark.org)

### Autolinks

<https://commonmark.org>
<mailto:nobody@example.com>

### Raw HTML (Inline)

Press <kbd>Enter</kbd> to submit.

### Escapes & Entities

Backslash escapes allow literal characters: * _ [ ] # \` \\
Entities are parsed correctly: &copy; &amp; &#35; &#x22;

### Line Breaks

This line contains a soft line break
and wraps to the next line in the source.

This line ends with a hard line break using two trailing spaces.
This line ends with a hard line break using a backslash.And this is the final line.
`}
