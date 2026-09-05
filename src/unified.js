/* eslint-disable jsdoc/reject-any-type */

/**
 * @template {any} S
 * @param {import('unified').Plugin<S[], any>} plugin
 * @param {...S} settings
 * @returns {[import('unified').Plugin<S[], any>, ...S[]]}
 */
export function definePlugin(plugin, ...settings) {
	return [plugin, ...settings];
}
