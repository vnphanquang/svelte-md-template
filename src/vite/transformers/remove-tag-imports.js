import { walk } from 'zimmerframe';

/**
 * @typedef Position
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef RemoveTagImportsInput
 * @property {import('magic-string').MagicString} s
 * @property {import('svelte/compiler').AST.Root} ast
 * @property {string} [importSource]
 */

/**
 * @param {RemoveTagImportsInput} input
 * @returns {string[]} names of imported tags
 */
export function removeTagImports(input) {
	const { s, ast, importSource = 'svelte-md-template' } = input;

	/** @type {string[]} */
	const names = [];

	for (const script of [ast.module, ast.instance]) {
		if (!script) continue;
		walk(/** @type {import('estree').Node & Position}  */ (/** @type {unknown} */ (script)), null, {
			ImportDeclaration(node, { next }) {
				if (node.source.value !== importSource) return next();
				for (const specifier of node.specifiers) {
					names.push(specifier.local.name);
				}
				s.remove(node.start, node.end);
			},
		});
	}

	return names;
}
