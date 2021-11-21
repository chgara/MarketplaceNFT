module.exports = {
	printWidth: 70,
	tabWidth: 4,
	useTabs: true,
	singleQuote: true,
	jsxSingleQuote: true,
	arrowParens: 'avoid',
	overrides: [
		{
			files: '*.sol',
			options: {
				printWidth: 80,
				tabWidth: 4,
				useTabs: true,
				singleQuote: false,
				bracketSpacing: false,
				explicitTypes: 'always',
			},
		},
	],
};
