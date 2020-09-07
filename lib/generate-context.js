const path = require('path');
const crypto = require('crypto');

function inferArgs(params, args) {
	args = Array.from(args).slice();
	const mappedArgs = {};

	for (let param in params) {
		const matcher = params[param];
		for (let i = 0; i < args.length; i++) {
			const arg = args[i];
			if (matcher(arg)) {
				mappedArgs[param] = arg;
				args.splice(i, 1);
				break;
			}
		}
	}

	return mappedArgs;
}

const hashParams = {
	hashType: (str) => crypto.getHashes().includes(str),
	digestType: (str) => ['hex', 'base64'].includes(str),
	length: (str) => /^\d+$/.test(str),
};

class Context {
	constructor(opts) {
		Object.assign(this, opts);
	}

	toString() {
		return this.path + this.name + this.ext + this._content + this.local;
	}

	hash() {
		const {
			hashType = 'md4',
			digestType = 'hex',
			length,
		} = inferArgs(hashParams, arguments);

		let hashed = crypto.createHash(hashType).update(this.toString()).digest(digestType);

		if (length) {
			hashed = hashed.slice(0, length);
		}

		return hashed;
	}
}

function generateContext({ file, css }) {
	const ext = path.extname(file);
	const basename = path.basename(file, ext);
	const dirname = path.dirname(file);
	const context = new Context({
		ext: ext.slice(1),
		name: basename,
		path: dirname,
		_content: css,
	});

	return (propertyName) => {
		const contextInstance = Object.create(context);
		contextInstance.local = propertyName.slice(2);
		return contextInstance;
	};
}

module.exports = generateContext;
