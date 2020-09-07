const postcss = require('postcss');
const PropertyNameManifest = require('./property-name-manifest');
const transformValue = require('./transform-value');
const sanitizePropertyName = require('./sanitize-property-name');
const interpolater = require('./interpolater');
const generateContext = require('./generate-context');

const transformerWrapper = (
	transformerFn,
	manifest = new PropertyNameManifest(),
) => (context) => {
	let newPropertyName = transformerFn(context);
	newPropertyName = sanitizePropertyName(newPropertyName);

	manifest.mark(newPropertyName, context.local);

	return `--${newPropertyName}`;
};

// From postcss-custom-properties
// https://github.com/postcss/postcss-custom-properties/blob/1e1ef6b/src/lib/transform-properties.js#L37
const customPropertyRegExp = /^--[A-z][\w-]*$/;
const customPropertiesRegExp = /(^|[^\w-])var\([\W\w]+\)/;

const customPropertiesTransformer = postcss.plugin('postcss-custom-properties-transformer', (opts) => {
	let transformer;

	if (typeof opts.transformer === 'function') {
		transformer = opts.transformer;
	} else if (typeof opts.transformer === 'string') {
		transformer = (context) => interpolater(opts.transformer, context);
	}

	transformer = transformerWrapper(transformer);

	return (root) => {
		const contextMaker = generateContext(root.source.input);

		root.walkDecls((decl) => {
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
