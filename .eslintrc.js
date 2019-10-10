module.exports = {
    'env': {
        'node': true,
        'es6': true,
        'jest': true,
    },
    'extends': 'eslint:recommended',
    'extends': ["plugin:prettier/recommended"],
    'parserOptions': {
        'ecmaVersion': 2018
    },
    'rules': {
        "no-console": 0
    }
};