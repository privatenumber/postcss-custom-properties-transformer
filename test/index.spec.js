const postcss = require('postcss');
const postcssCustomPropertiesTransformer = require('..');

const transform = (css, opts) => postcss([
	postcssCustomPropertiesTransformer(opts)
]).process(css, {
	from: '/dir/src/file.css',
	to: '/dir/dist/file.css',
}).then(({ css }) => css);


const fixtures = {
	basicVar: `
	.className {
		--color: red;
		--font-size: 24px;
		background: var(--color);
		border-color: var(--color);
		font-size: var(--font-size);
	}
	`,
};

describe('template string', () => {

	test('namespace', async () => {
		const output = await transform(fixtures.basicVar, {
			transformer: 'namespace-[local]',
		});

		expect(output).toMatchSnapshot();
	});

	test('path & name & ext', async () => {
		const output = await transform(fixtures.basicVar, {
			transformer: '[path]-[name]-[ext]-[local]',
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

		test('hash - md5 hash', async () => {
			const output = await transform(fixtures.basicVar, {
				transformer: '[hash:md5]',
			});

			expect(output).toMatchSnapshot();
		});

		test('hash - md4 hash', async () => {
			const output = await transform(fixtures.basicVar, {
				transformer: '[hash:md4]',
			});

			expect(output).toMatchSnapshot();
		});

		test('hash - md5 hash - truncated 5', async () => {
			const output = await transform(fixtures.basicVar, {
				transformer: '[hash:md5:5]',
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
	});
});

describe('transformer function', () => {

	test('namespace', async () => {
		const output = await transform(fixtures.basicVar, {
			transformer({ local }) {
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
