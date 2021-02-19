const {transform, md5} = require('./utils');
const fixtures = require('./fixtures');

describe('error handling', () => {
	test('no options', () => {
		expect(() => transform(fixtures)).toThrowError('[postcss-custom-properties-transformer] a transformer must be passed in');
	});

	test('no transformer', () => {
		expect(() => transform(fixtures, {})).toThrowError('[postcss-custom-properties-transformer] a transformer must be passed in');
	});

	test('invalid transformer', () => {
		expect(() => transform(fixtures, {
			transformer: 123,
		})).toThrowError('[postcss-custom-properties-transformer] transformer must be a function');
	});

	test('transformer collision warning', async () => {
		const spy = jest.spyOn(global.console, 'warn').mockImplementation();
		await transform(fixtures, {
			transformer() {
				return 'constant-value';
			},
		});
		expect(spy).toHaveBeenCalledWith('[postcss-custom-properties-transformer] Collision: property name "--constant-value" was generated from input "--font-size" but was already generated from input "--color"');
		spy.mockRestore();
	});
});

describe('transformer function', () => {
	test('namespace', async () => {
		const output = await transform(fixtures, {
			transformer({property}) {
				return `app-${property}`;
			},
		});

		expect(output).toMatchSnapshot();
	});

	test('emoji namespace', async () => {
		const output = await transform(fixtures, {
			transformer({property}) {
				return `🔥-${property}`;
			},
		});

		expect(output).toMatchSnapshot();
	});

	test('custom hash', async () => {
		const output = await transform(fixtures, {
			transformer({property}) {
				return md5(property).slice(0, 6);
			},
		});

		expect(output).toMatchSnapshot();
	});

	test('custom hash - scoped to file', async () => {
		const output = await transform(fixtures, {
			transformer({property, filepath}) {
				return md5(filepath + property).slice(0, 6);
			},
		});

		expect(output).toMatchSnapshot();
	});
});

describe('transform options', () => {
	test('value declarations', async () => {
		const output = await transform(fixtures, {
			transformValueDeclarations: true,
			transformer({property}) {
				return `app-${property}`;
			},
		});

		expect(output).toMatchSnapshot();
	});
});
