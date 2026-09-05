import { walk } from 'zimmerframe';

const SEGMENT_MARKER = '<!-- END_SEGMENT -->';

/**
 * @typedef Position
 * @property {number} start
 * @property {number} end
 */

/**
 * @template {import('estree').Node} N
 * @param {N} node
 * @returns {N & Position}
 */
function nodeWithPosition(node) {
	return /** @type {N & Position} */ (/** @type {unknown} */ (node));
}

/**
 * @typedef TransformMarkdownInput
 * @property {import('magic-string').MagicString} s
 * @property {import('svelte/compiler').AST.Root} ast
 * @property {string[]} templates
 * @property {(markdown: string) => string | Promise<string>} transform
 */

/**
 * @param {TransformMarkdownInput} input
 * @returns {Promise<void>}
 */
export async function transformMarkdown(input) {
	const { s, ast, templates, transform } = input;

	let merged = '';
	/** @type {Position[]} */
	const positions = [];

	walk(
		/** @type {import('svelte/compiler').AST.ExpressionTag} */ (
			/** @type {unknown} */ (ast.fragment)
		),
		null,
		{
			ExpressionTag(node, { next }) {
				const expression = node.expression;
				if (expression.type !== 'TaggedTemplateExpression') return next();
				if (expression.tag.type !== 'Identifier' || !templates.includes(expression.tag.name))
					return next();
				positions.push({ start: node.start, end: node.end });

				// remove `$` in expressions,
				// so that they are registered correctly in Svelte markup afterwards
				for (const exp of expression.quasi.expressions) {
					const { start } = nodeWithPosition(exp);
					s.remove(start - 2, start - 1);
				}

				const quasiLoc = nodeWithPosition(expression.quasi);
				merged += s.slice(quasiLoc.start + 1, quasiLoc.end - 1) + `\n\n${SEGMENT_MARKER}\n\n`;
			},
		},
	);

	const transformed = await transform(merged);
	const chunks = transformed.trim().split(SEGMENT_MARKER);
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		if (!chunk) continue;
		const { start, end } = positions[i];
		s.overwrite(start, end, chunk);
	}
}
