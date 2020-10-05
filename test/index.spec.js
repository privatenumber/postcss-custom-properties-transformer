const postcss = require('postcss');
const postcssCustomPropertiesTransformer = require('..');
const fixtures = require('./fixtures');

const transform = (css, options) => postcss([
	postcssCustomPropertiesTransformer(options),
]).process(css, {
	from: '/dir/src/file.css',
	to: '/dir/dist/file.css',
}).then(({css}) => css);

describe('error handling', () => {
	test('no options', () => {
		expect(() => transform(fixtures.basicVar)).toThrowError('[postcss-custom-properties] a transformer must be passed in');
	});

	test('no transformer', () => {
		expect(() => transform(fixtures.basicVar, {})).toThrowError('[postcss-custom-properties] a transformer must be passed in');
	});

	test('invalid transformer', () => {
		expect(() => transform(fixtures.basicVar, {
			transformer: 123,
		})).toThrowError('[postcss-custom-properties] Unsupported transformer type "number"');
	});

	test('transformer collision', async () => {
		const spy = jest.spyOn(global.console, 'warn').mockImplementation();
		await transform(fixtures.basicVar, {
			transformer() {
				return 'constant-value';
			},
		});
		expect(spy).toHaveBeenCalledWith('[postcss-custom-properties-transformer] Collision: property name "constant-value" was generated from input "font-size" but was already generated from input "color"');
		spy.mockRestore();
	});
});

describe('template string', () => {
	test('namespace', async () => {
		const output = await transform(fixtures.basicVar, {
			transformer: 'namespace-[local]',
		});

		expect(output).toMatchSnapshot();
	});

	test('filepath', async () => {
		const output = await transform(fixtures.basicVar, {
			transformer: '[filepath]-[local]',
		});

		expect(output).toMatchSnapshot();
	});

	describe('hash', () => {
		test('hash', async () => {
			const output = await transform(fixtures.basicVar, {
				transformer: '[hash]',
			});

			expect(output).toMatchSnapshot();
		});

		test('hash - truncated 3', async () => {
			const output = await transform(fixtures.basicVar, {
				transformer: '[hash:3]',
			});

			expect(output).toMatchSnapshot();
		});

		test('hash - sha128 hash', async () => {
			const output = await transform(fixtures.basicVar, {
				transformer: '[hash:sha128]',
			});

			expect(output).toMatchSnapshot();
		});

		test('hash - sha128 hash - truncated 5', async () => {
			const output = await transform(fixtures.basicVar, {
				transformer: '[hash:sha128:5]',
			});

			expect(output).toMatchSnapshot();
		});

		test('hash - base64 digest', async () => {
			const output = await transform(fixtures.basicVar, {
				transformer: '[hash:base64]',
			});

			expect(output).toMatchSnapshot();
		});

		test('hash - base64 digest - truncated 5', async () => {
			const output = await transform(fixtures.basicVar, {
				transformer: '[hash:base64:5]',
			});

			expect(output).toMatchSnapshot();
		});

		test('hash - filepath namespace', async () => {
			const output = await transform(fixtures.basicVar, {
				transformer: '[hash:filepath:3]-[hash:3]',
			});

			expect(output).toMatchSnapshot();
		});
	});

	test('hash salt', async () => {
		const output = await transform(fixtures.basicVar, {
			hashSalt: 'salt',
			transformer: '[hash:filepath:3]-[hash:3]',
		});

		expect(output).toMatchSnapshot();
	});
});

describe('transformer function', () => {
	test('namespace', async () => {
		const output = await transform(fixtures.basicVar, {
			transformer({local}) {
				return `namespace-${local}`;
			},
		});

		expect(output).toMatchSnapshot();
	});

	test('hash', async () => {
		const output = await transform(fixtures.basicVar, {
			transformer(context) {
				return context.hash('md5', 'base64', 10);
			},
		});

		expect(output).toMatchSnapshot();
	});

	test('return template', async () => {
		const output = await transform(fixtures.basicVar, {
			transformer() {
				return '[filepath]-[local]';
			},
		});

		expect(output).toMatchSnapshot();
	});

	test('collision warning', async () => {
		const warn = jest.spyOn(global.console, 'warn').mockImplementation();

		const output = await transform(fixtures.basicVar, {
			transformer() {
				return 'collide';
			},
		});

		expect(output).toMatchSnapshot();
		expect(warn).toHaveBeenCalled();
	});
});
