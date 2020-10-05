const fixtures = {
	'file-a.css': `
	.button {
		--color: red;
		--font-size: 24px;
		background: var(--color);
		border-color: var(--color);
		font-size: var(--font-size);
	}

	.input {
		--color: red;
		--font-size: 24px;
		background: var(--color);
		border-color: var(--color);
		font-size: var(--font-size);
		border: 1px solid var(--color);
	}
	`,
	'file-b.css': `
	:root {
		--color: red;
		--font-size: 24px;
		--large-font-size: calc(var(--font-size) * 2);
	}
	.section {
		background: var(--color);
		border-color: var(--color);
		font-size: var(--font-size);
	}

	.heading {
		background: var(--color);
		border-color: var(--color);
		font-size: var(--font-size);
		border: 1px solid var(--color);
	}
	`,
};

module.exports = fixtures;
