/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Root } from 'mdast';
import type { Processor } from 'unified';

export type FilterIdSpecs = (string | RegExp)[] | string | RegExp;

type SvelteMdTemplateTransformer =
	| {
			type: 'unified';
			processor: (defaultProcessor: Processor<Root>) => Processor<Root, any, any, any, any> | void;
	  }
	| {
			type: 'custom';
			transform: (markdown: string) => string | Promise<string>;
	  };

export interface SvelteMdTemplateOptions {
	include?: FilterIdSpecs;
	exclude?: FilterIdSpecs;
	transformer?: SvelteMdTemplateTransformer;
}
