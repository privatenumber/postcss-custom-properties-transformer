const postcss = require('postcss');
const assert = require('assert');
const PropertyNameManifest = require('./property-name-manifest');
const transformValue = require('./transform-value');
const sanitizePropertyName = require('./sanitize-property-name');
const interpolater = require('./interpolater');
const generateContext = require('./generate-context');

const transformerWrapper = (
	transformerFn,
	manifest = new PropertyNameManifest(),
) => context => {
	let newPropertyName = transformerFn(context);
	newPropertyName = sanitizePropertyName(newPropertyName);

	manifest.mark(newPropertyName, context.local);

	return `--${newPropertyName}`;
};

// From postcss-custom-properties
// https://github.com/postcss/postcss-custom-properties/blob/1e1ef6b/src/lib/transform-properties.js#L37
const customPropertyRegExp = /^--[A-z][\w-]*$/;
const customPropertiesRegExp = /(^|[^\w-])var\([\W\w]+\)/;

const customPropertiesTransformer = postcss.plugin('postcss-custom-properties-transformer', options => {
	assert(options && options.transformer, '[postcss-custom-properties] a transformer must be passed in');

	let {transformer} = options;

	if (typeof transformer === 'string') {
		const template = transformer;
		transformer = context => interpolater(template, context);
	} else if (typeof transformer !== 'function') {
		throw new TypeError(`[postcss-custom-properties] Unsupported transformer type "${typeof options.transformer}"`);
	}

	transformer = transformerWrapper(transformer);

	return root => {
		const contextMaker = generateContext(root.source.input);

		root.walkDecls(decl => {
			// Custom property declaration
			if (customPropertyRegExp.test(decl.prop)) {
				decl.prop = transformer(contextMaker(decl.prop));
			}

			// Custom property usage
			if (customPropertiesRegExp.test(decl.value)) {
				decl.value = transformValue(decl.value, transformer, contextMaker);
			}
		});
	};
});

module.exports = customPropertiesTransformer;
