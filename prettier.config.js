module.exports = {
    semi: true,
    tabWidth: 4,
    printWidth: 100,
    useTabs: false,
    bracketSpacing: true,
    jsxBracketSameLine: true,
    singleQuote: true,
    trailingComma: 'all',
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 2,
            },
        },
    ],
};
