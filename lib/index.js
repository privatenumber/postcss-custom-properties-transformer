const postcss = require('postcss');
const assert = require('assert');
const processPropertyValue = require('./process-property-value');

const {stringify: string} = JSON;

// From postcss-custom-properties
// https://github.com/postcss/postcss-custom-properties/blob/1e1ef6b/src/lib/transform-properties.js#L37
const customPropertyPtrn = /^--[A-z][\w-]*$/;
const varFnPtrn = /(^|[^\w-])var\([\W\w]+\)/;
const name = 'postcss-custom-properties-transformer';

function markHashUsed(map, propertyName, originalPropertyName) {
	if (!map.has(propertyName)) {
		map.set(propertyName, originalPropertyName);
		return;
	}

	const previousPropName = map.get(propertyName);
	if (originalPropertyName !== previousPropName) {
		console.warn(`[${name}] Collision: property name ${string(propertyName)} was generated from input ${string(originalPropertyName)} but was already generated from input ${string(previousPropName)}`);
	}
}

const createTransformer = transformer => {
	const usedPropertyNames = new Map();

	return (customProperty, data) => {
		data.local = customProperty.slice(2);

		const newPropertyName = '--' + transformer(data);

		markHashUsed(usedPropertyNames, newPropertyName, customProperty);

		return newPropertyName;
	};
};

const customPropertiesTransformer = postcss.plugin(name, options => {
	assert(options && options.transformer, `[${name}] a transformer must be passed in`);
	assert(typeof options.transformer === 'function', `[${name}] transformer must be a function`);

	const transformer = createTransformer(options.transformer);

	return root => {
		const data = Object.create({
			filepath: root.source.input.file,
			css: root.source.input.css,
		});

		root.walkDecls(decl => {
			// Custom property declaration
			if (customPropertyPtrn.test(decl.prop)) {
				decl.prop = transformer(decl.prop, data);
			}

			// Custom property usage
			if (varFnPtrn.test(decl.value)) {
				decl.value = processPropertyValue(decl.value, customProperty => transformer(customProperty, data));
			}
		});
	};
});

module.exports = customPropertiesTransformer;
