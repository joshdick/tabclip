import { defineConfig } from 'wxt'

export default defineConfig({
	srcDir: 'src',
	// WXT resolves publicDir relative to the project root, not srcDir, so this
	// must be set explicitly to keep public assets (icons) under src/.
	publicDir: 'src/public',
	manifestVersion: 3,
	// tabclip is an existing, already-published extension, exempt from this
	// new-extension-only requirement.
	suppressWarnings: {
		firefoxDataCollection: true,
	},
	manifest: ({ browser }) => ({
		name: 'tabclip',
		description: 'Copy browser tabs to (or create them from) your clipboard.',
		author: 'Josh Dick',
		homepage_url: 'https://joshdick.github.io/tabclip',
		icons: {
			16: 'icon/16.png',
			32: 'icon/32.png',
			48: 'icon/48.png',
			128: 'icon/128.png',
		},
		action: {
			default_icon: 'icon/128.png',
			default_title: 'tabclip',
		},
		commands: {
			'copy-tabs': {
				suggested_key: {
					default: 'Ctrl+Shift+C',
					mac: 'MacCtrl+Shift+C',
				},
				description: 'Copy tab(s) to the clipboard',
			},
			'paste-tabs': {
				suggested_key: {
					default: 'Ctrl+Shift+V',
					mac: 'MacCtrl+Shift+V',
				},
				description: 'Paste tab(s) from the clipboard',
			},
		},
		permissions: [
			'clipboardRead', 'clipboardWrite', 'notifications', 'storage', 'tabs',
			...(browser === 'chrome' ? ['offscreen'] : []),
		],
		...(browser === 'firefox' ? {
			browser_specific_settings: {
				gecko: {
					id: '{c9aa4e81-8153-4fcd-946e-d60c4ea4e886}',
				},
			},
		} : {}),
	}),
})
