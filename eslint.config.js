import js from '@eslint/js'
import globals from 'globals'
import wxtAutoImports from './.wxt/eslint-auto-imports.mjs'

export default [
	{ ignores: ['.output/**', '.wxt/**', 'node_modules/**'] },
	js.configs.recommended,
	wxtAutoImports,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.webextensions,
			},
		},
		rules: {
			'no-console': 'off',
			indent: ['error', 'tab'],
			'linebreak-style': ['error', 'unix'],
			quotes: ['error', 'single'],
			semi: ['error', 'never'],
		},
	},
]
