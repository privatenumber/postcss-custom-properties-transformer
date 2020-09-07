const cssesc = require('cssesc');

const notAllowedChars = /[^\w\d-_]/gi;

// https://github.com/webpack-contrib/css-loader/blob/ec58a7c/src/utils.js#L67
const sanitizePropertyName = propertyName => cssesc(
	propertyName
		.replace(/^(-?\d)/, '_$1')
		.replace(notAllowedChars, '_'),
	{isIdentifier: true},
);

module.exports = sanitizePropertyName;
