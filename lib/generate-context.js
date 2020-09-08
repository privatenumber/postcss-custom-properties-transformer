const crypto = require('crypto');
const hasOwnProp = require('has-own-prop');

function inferArgs(parameters, args) {
	args = Array.from(args).slice();
	const mappedArgs = {};

	for (const parameter in parameters) {
		if (hasOwnProp(parameters, parameter)) {
			const matcher = parameters[parameter];
			for (let i = 0; i < args.length; i++) {
				const arg = args[i];

				if (
					(typeof matcher === 'function' && matcher(arg)) ||
					(Array.isArray(matcher) && matcher.includes(arg)) ||
					(matcher instanceof RegExp && matcher.test(arg))
				) {
					mappedArgs[parameter] = arg;
					args.splice(i, 1);
					break;
				}
			}
		}
	}

	return mappedArgs;
}

const hashParameters = {
	key: ['local', 'filepath', 'css'],
	hashType: crypto.getHashes(),
	digestType: ['hex', 'base64'],
	length: /^\d+$/,
};

const leadingNumbers = /^\d+/;

class Context {
	constructor(filepath, css) {
		Object.assign(this, {
			filepath,
			css,
			local: undefined,
		});
	}

	toString() {
		return JSON.stirngify(this);
	}

	hash() {
		const {
			key = 'local',
			hashType = 'md5',
			digestType = 'hex',
			length,
		} = inferArgs(hashParameters, arguments);

		let hashed = crypto.createHash(hashType).update(this[key]).digest(digestType);

		if (length) {
			const stringLength = Number.parseInt(length, 10);
			const hasLeadingNumbers = hashed.match(leadingNumbers);
			let startIdx = 0;
			if (hasLeadingNumbers) {
				const newHashLength = hashed.length - hasLeadingNumbers[0].length;
				if (newHashLength >= stringLength) {
					startIdx = hasLeadingNumbers[0].length;
				}
			}

			hashed = hashed.slice(startIdx, startIdx + stringLength);
		}

		return hashed;
	}
}

function generateContext({file, css}) {
	const context = new Context(file, css);
	return propertyName => {
		const contextInstance = Object.create(context);
		contextInstance.local = propertyName.slice(2);
		return contextInstance;
	};
}

module.exports = generateContext;
