/* eslint-disable jsdoc/reject-any-type */

import { VFile } from 'vfile';
import { walk } from 'zimmerframe';

const DELIMITER = '<!-- SVELTE_MD -->';

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
 * @property {string} id
 * @property {import('../types.public').SvelteMdTemplateTransform} transform
 */

/**
 * @param {TransformMarkdownInput} input
 * @returns {Promise<void>}
 */
export async function transformMarkdown(input) {
	const { s, ast, tags, transform, id } = input;

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
				const template = s.snip(quasiLoc.start + 1, quasiLoc.end - 1);

				for (const quasis of expression.quasi.quasis) {
					const {
						start,
						end,
						value: { cooked },
					} = nodeWithPosition(quasis);
					if (cooked) {
						// FIXME: add test case to trigger else path for this
						template.update(start, end, cooked);
					}
				}

				// remove $ from expression, i.e ${...}, so that they are registered correctly as
				// Svelte ExpressionTag afterwards
				// Note: we mark only, then unesacpe after `transform` has run, so that other `{`
				// emerging form `transform` can be escaped first
				for (const exp of expression.quasi.expressions) {
					const { start } = nodeWithPosition(exp);
					template.update(start - 2, start, '!EXP!');
				}

				templates.push(template.toString());
			},
		},
	);

	// return early if no template is detected
	if (!templates.length) return;

	const replacements = await transform({ templates, id });
	for (let i = 0; i < replacements.length; i++) {
		const { start, end } = positions[i];
		const replacement = replacements[i]
			.replaceAll('{', () => '&lbrace;')
			.replaceAll('!EXP!', () => '{');
		s.update(start, end, replacement);
	}
}

/**
 * @param {import('unified').Processor<any, any, any, any, any>} processor
 * @returns {import('../types.public').SvelteMdTemplateTransform}
 */
export function createUnifiedTransform(processor) {
	return async function ({ templates, id }) {
		const merged = templates.join(`\n\n${DELIMITER}\n\n`);
		const vfile = new VFile(merged);
		if (id) vfile.path = id; // FIXME: missing test case to trigger else path
		const transformed = (await processor.process(vfile)).toString().trim();
		return transformed.split(DELIMITER);
	};
}
