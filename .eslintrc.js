module.exports = {
    'parser': 'babel-eslint',
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        'plugin:compat/recommended',
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        'ecmaFeatures': {
            'jsx': true
        }
    },
    "plugins": [
        'compat',
    ],
    "rules": {
        'no-console': 'off',
        'arrow-parens': ['error', 'as-needed'],
        'no-const-assign': 'error',
        'prefer-template': 'off',
        'no-unused-vars': 'warn',
    },
}
