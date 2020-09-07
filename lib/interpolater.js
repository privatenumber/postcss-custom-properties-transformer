const bracketVarPtrn = /\[([\w:]+)]/gi;

function interpolater(templateString, data) {
	return templateString.replace(bracketVarPtrn, (match, placeholder) => {
		const [varName, ...args] = placeholder.split(':');
		let hasData = data[varName];

		if (hasData) {
			if (typeof hasData === 'function') {
				hasData = hasData.apply(data, args);
			}

			return hasData;
		}

		return match;
	});
}

module.exports = interpolater;
