/* eslint-disable jsdoc/reject-any-type */

import { walk } from 'zimmerframe';

const DELIMITER = '<!-- SVELTE_MD -->';

/**
 * @typedef {(templates: string[]) => string[] | Promise<string[]>} Transform
 */

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
 * @property {string[]} tags
 * @property {Transform} transform
 */

/**
 * @param {TransformMarkdownInput} input
 * @returns {Promise<void>}
 */
export async function transformMarkdown(input) {
	const { s, ast, tags, transform } = input;

	/** @type {string[]} */
	const templates = [];
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
				if (expression.tag.type !== 'Identifier' || !tags.includes(expression.tag.name))
					return next();
				positions.push({ start: node.start, end: node.end });
				const quasiLoc = nodeWithPosition(expression.quasi);
				templates.push(s.slice(quasiLoc.start + 1, quasiLoc.end - 1));
			},
		},
	);

	// return early if no template is detected
	if (!templates.length) return;

	const replacements = await transform(templates);
	for (let i = 0; i < replacements.length; i++) {
		const { start, end } = positions[i];
		const replacement = replacements[i]
			// escape {...} otherwise will be registered as Svelte ExpressionTag afterwards
			.replace(/(?<!\$)\{/g, '&lbrace;')
			// so that they are registered correctly as Svelte ExpressionTag afterwards
			.replace(/\$\{/g, '{');
		s.overwrite(start, end, replacement);
	}
}

/**
 * @param {import('unified').Processor<any, any, any, any, any>} processor
 * @returns {Transform}
 */
export function createUnifiedTransform(processor) {
	return async function (templates) {
		const merged = templates.join(`\n\n${DELIMITER}\n\n`);
		const transformed = (await processor.process(merged)).toString().trim();
		return transformed.split(DELIMITER);
	};
}
