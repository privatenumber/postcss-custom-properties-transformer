const crypto = require('crypto');
const postcss = require('postcss');
const postcssCustomPropertiesTransformer = require('..');

const hash = string => crypto.createHash('md5').update(string).digest('hex');

const transform = (cssFiles, options) => {
	const processor = postcss([
		postcssCustomPropertiesTransformer(options),
	]);

	return Promise.all(Object.entries(cssFiles).map(async ([name, cssFile]) => {
		const result = await processor.process(cssFile, {
			from: name,
			to: name,
		});
		return result.css;
	}));
};

module.exports = {
	transform,
	hash,
};
