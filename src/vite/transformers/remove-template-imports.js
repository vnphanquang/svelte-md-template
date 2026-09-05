import { walk } from 'zimmerframe';

/**
 * @typedef Position
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef RemoveTemplateImportsInput
 * @property {import('magic-string').MagicString} s
 * @property {import('svelte/compiler').AST.Root} ast
 * @property {string} [templateSource]
 */

/**
 * @param {RemoveTemplateImportsInput} input
 * @returns {string[]} names of imported template
 */
export function removeTemplateImports(input) {
	const { s, ast, templateSource = 'svelte-md-template' } = input;

	/** @type {string[]} */
	const names = [];

	for (const script of [ast.module, ast.instance]) {
		if (!script) continue;
		walk(/** @type {import('estree').Node & Position}  */ (/** @type {unknown} */ (script)), null, {
			ImportDeclaration(node, { next }) {
				if (node.source.value !== templateSource) return next();
				for (const specifier of node.specifiers) {
					names.push(specifier.local.name);
				}
				s.remove(node.start, node.end);
			},
		});
	}

	return names;
}
