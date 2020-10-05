const postcss = require('postcss');
const assert = require('assert');
const processPropertyValue = require('./process-property-value');
const sanitizePropertyName = require('./sanitize-property-name');
const interpolater = require('./interpolater');
const generateContext = require('./generate-context');

const {stringify: string} = JSON;

function markHashUsed(map, propertyName, originalPropertyName) {
	if (map.has(propertyName)) {
		const previousPropName = map.get(propertyName);
		if (originalPropertyName !== previousPropName) {
			console.warn(`[postcss-custom-properties-transformer] Collision: property name ${string(propertyName)} was generated from input ${string(originalPropertyName)} but was already generated from input ${string(previousPropName)}`);
		}
	} else {
		map.set(propertyName, originalPropertyName);
	}
}

const createTransformer = (transformer, manifest) => {
	return context => {
		let newPropertyName = typeof transformer === 'function' ? transformer(context) : transformer;

		newPropertyName = interpolater(newPropertyName, context);

		newPropertyName = sanitizePropertyName(newPropertyName);

		markHashUsed(manifest, newPropertyName, context.local);

		return `--${newPropertyName}`;
	};
};

// From postcss-custom-properties
// https://github.com/postcss/postcss-custom-properties/blob/1e1ef6b/src/lib/transform-properties.js#L37
const customPropertyRegExp = /^--[A-z][\w-]*$/;
const customPropertiesRegExp = /(^|[^\w-])var\([\W\w]+\)/;

const customPropertiesTransformer = postcss.plugin('postcss-custom-properties-transformer', options => {
	assert(options && options.transformer, '[postcss-custom-properties] a transformer must be passed in');
	assert(['function', 'string'].includes(typeof options.transformer), `[postcss-custom-properties] Unsupported transformer type "${typeof options.transformer}"`);

	const propertyNamesManifest = new Map();
	const transformer = createTransformer(options.transformer, propertyNamesManifest);

	return root => {
		const contextMaker = generateContext(root.source.input, options.hashSalt);

		root.walkDecls(decl => {
			// Custom property declaration
			if (customPropertyRegExp.test(decl.prop)) {
				decl.prop = transformer(contextMaker(decl.prop));
			}

			// Custom property usage
			if (customPropertiesRegExp.test(decl.value)) {
				decl.value = processPropertyValue(decl.value, transformer, contextMaker);
			}
		});
	};
});

module.exports = customPropertiesTransformer;
