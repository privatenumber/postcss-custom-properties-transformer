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

module.exports = fixtures;
