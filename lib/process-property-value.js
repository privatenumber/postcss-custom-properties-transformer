const {parse} = require('postcss-values-parser');

function transformAstVars(root, transformer) {
	if (!root.nodes) {
		return;
	}

	root.nodes.forEach(node => {
		if (node.isVar) {
			node.nodes.forEach(node2 => {
				if (node2.isVariable) {
					node2.value = transformer(node2.value);
				}
			});
		} else {
			transformAstVars(node, transformer);
		}
	});
}

function processPropertyValue(value, transformer, contextMaker) {
	const parsed = parse(value);

	transformAstVars(parsed, prop => transformer(contextMaker(prop)));

	return parsed.toString();
}

module.exports = processPropertyValue;
