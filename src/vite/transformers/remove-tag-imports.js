import { walk } from 'zimmerframe';

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
				/** @type {Position[]} */
				let removals = [];
				for (let i = 0; i < node.specifiers.length; i++) {
					const specifier = node.specifiers[i];

					if (specifier.type !== 'ImportSpecifier') continue;

					const { imported, local } = specifier;
					if (
						(imported.type === 'Identifier' && imported.name !== 'markdown') ||
						(imported.type === 'Literal' && imported.value !== 'markdown')
					)
						continue;
					names.push(local.name);

					const { start, end } = nodeWithPosition(specifier);
					removals.push({ start, end: i < node.specifiers.length - 1 ? end + 1 : end });
				}
				if (removals.length === node.specifiers.length) {
					s.remove(node.start, node.end);
				} else {
					for (const { start, end } of removals) {
						s.remove(start, end);
					}
				}
			},
		});
	}

	return names;
}
