module.exports = {
	extends: 'erb',
	plugins: ['@typescript-eslint'],
	// Ignore shadcn/ui components
	ignorePatterns: ['**/components/ui/**', '**/renderer/lib/**'],
	rules: {
		// A temporary hack related to IDE not resolving correct package.json
		// 'import/no-extraneous-dependencies': 'off',
		// eslint-plugin-compat (via `plugin:compat/recommended` in eslint-config-erb)
		// is a *browser* compatibility linter. It resolves the `browserslist` key in
		// package.json, which `browserslist-config-erb` renders as the exact installed
		// Electron version (e.g. `electron 40.10.6`). browserslist truncates that to a
		// minor and looks it up in electron-to-chromium; a missing key is a hard throw,
		// so a data package older than the installed Electron takes down the whole lint
		// run with exit 2 -- before `tsc` and `npm test` ever get to run. That is what
		// kept `test.yml` red on main from 2026-05-21 to 2026-11-11 (LAC-7227).
		//
		// The rule is off rather than re-pointed because Electron ships its own pinned
		// Chromium: there is no unknown browser for it to warn about, so it carries no
		// value here to offset that cost. It is also the only lint-time reader of
		// browserslist, so switching it off removes the failure class outright instead
		// of resetting the clock until the next Electron bump.
		//
		// The `browserslist` key itself stays: autoprefixer still reads it at *build*
		// time, where it must stay pinned to the Chromium this app actually runs, and
		// where a stale-data throw is loud and appropriate rather than silent.
		'compat/compat': 'off',

		'react/react-in-jsx-scope': 'off',
		'react/jsx-filename-extension': 'off',
		'import/extensions': 'off',
		'import/no-unresolved': 'off',
		'import/no-import-module-exports': 'off',
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': 'error',
		'no-unused-vars': 'off',

		// Added in Electron-Hotplate
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				vars: 'all',
				varsIgnorePattern: '^_',
				args: 'after-used',
				argsIgnorePattern: '^_',
			},
		],
		'consistent-return': 'off',
		'import/prefer-default-export': 'off',
		'promise/always-return': 'off',
		'react/jsx-props-no-spreading': 'off',
		'react/jsx-no-useless-fragment': 'off',
		'react/prop-types': 'off',
		'react/require-default-props': 'off',
	},
	overrides: [
		{
			// Build tooling and main-process code legitimately import devDependencies.
			// `electron` is a devDependency on purpose in electron-react-boilerplate:
			// the runtime Electron is supplied by electron-builder into the packaged
			// app, never bundled out of node_modules. Webpack configs and .erb scripts
			// are likewise never shipped. The rule stays *on* with `devDependencies`
			// allowed rather than switched off, so a genuinely phantom import is still
			// caught here (LAC-7227).
			files: [
				'.erb/**/*.js',
				'.erb/**/*.ts',
				'*.config.js',
				'*.config.ts',
				'src/main/**/*.ts',
			],
			rules: {
				'import/no-extraneous-dependencies': [
					'error',
					{ devDependencies: true },
				],
			},
		},
	],
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
	},
	settings: {
		'import/resolver': {
			// See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
				moduleDirectory: ['node_modules', 'src/'],
			},
			webpack: {
				config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
			},
			typescript: {},
		},
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
	},
};
