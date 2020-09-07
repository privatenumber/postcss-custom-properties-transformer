const path = require('path');
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
				if (matcher(arg)) {
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
	hashType: string => crypto.getHashes().includes(string),
	digestType: string => ['hex', 'base64'].includes(string),
	length: string => /^\d+$/.test(string),
};

class Context {
	constructor(options) {
		Object.assign(this, options);
	}

	toString() {
		return this.path + this.name + this.ext + this._content + this.local;
	}

	hash() {
		const {
			hashType = 'md4',
			digestType = 'hex',
			length,
		} = inferArgs(hashParameters, arguments);

		let hashed = crypto.createHash(hashType).update(this.toString()).digest(digestType);

		if (length) {
			hashed = hashed.slice(0, length);
		}

		return hashed;
	}
}

function generateContext({file, css}) {
	const ext = path.extname(file);
	const basename = path.basename(file, ext);
	const dirname = path.dirname(file);
	const context = new Context({
		ext: ext.slice(1),
		name: basename,
		path: dirname,
		_content: css,
	});

	return propertyName => {
		const contextInstance = Object.create(context);
		contextInstance.local = propertyName.slice(2);
		return contextInstance;
	};
}

module.exports = generateContext;
