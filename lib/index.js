const postcss = require('postcss');
const assert = require('assert');
const PropertyNameManifest = require('./property-name-manifest');
const transformValue = require('./transform-value');
const sanitizePropertyName = require('./sanitize-property-name');
const interpolater = require('./interpolater');
const generateContext = require('./generate-context');

const transformerWrapper = (
	transformer,
	manifest = new PropertyNameManifest(),
) => context => {
	let newPropertyName = typeof transformer === 'function' ? transformer(context) : transformer;

	newPropertyName = interpolater(newPropertyName, context);

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
	assert(['function', 'string'].includes(typeof options.transformer), `[postcss-custom-properties] Unsupported transformer type "${typeof options.transformer}"`);

	const transformer = transformerWrapper(options.transformer);

	return root => {
		const contextMaker = generateContext(root.source.input, options.hashSalt);

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
