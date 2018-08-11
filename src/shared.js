const getUrls = require('get-urls')
const browser = require('webextension-polyfill')

const clipboardBridge = document.querySelector('#clipboardBridge')
clipboardBridge.contentEditable = true

// Options for [normalize-url](https://github.com/sindresorhus/normalize-url)
// passed through by [get-urls](https://github.com/sindresorhus/get-urls)
const NORMALIZE_URL_OPTIONS = Object.freeze({
	removeTrailingSlash: false,
	sortQueryParameters: false,
	stripFragment: false,
	stripWWW: false
})

const ALERT_OPERATIONS = Object.freeze({
	COPY: Symbol('copy'),
	PASTE: Symbol('paste')
})

const readFromClipboard = () => {
	clipboardBridge.focus()
	document.execCommand('selectAll')
	document.execCommand('paste')
	const result = clipboardBridge.innerText
	clipboardBridge.innerText = ''
	return result
}

const writeToClipboard = (text) => {
	clipboardBridge.innerText = text
	clipboardBridge.focus()
	document.execCommand('selectAll')
	document.execCommand('copy')
	clipboardBridge.innerText = ''
}

const copyTabs = (currentWindow, includeTitles) => {
	// Return an array where each element represents a window,
	// where a window is itself an array where each element is a tab.
	const getTabsByWindow = () => {
		if (currentWindow) {
			return browser.tabs.query({ currentWindow }).then((tabs) => [tabs])
		} else {
			const tabsByWindow = []
			return browser.windows.getAll({ populate: true }).then((windows) => {
				for (const window of windows) {
					const tabs = []
					for (const tab of window.tabs) {
						tabs.push(tab)
					}
					tabsByWindow.push(tabs)
				}
				return tabsByWindow
			})
		}
	}

	return getTabsByWindow().then(tabsByWindow => {
		let tabCount = 0
		const output =
			tabsByWindow.map(
				tabs => tabs.map(tab => {
					tabCount += 1
					const title = includeTitles ? ` | ${tab.title}` : ''
					return `${tab.url}${title}`
				}).join('\n') // Combine all tabs for one window into a string, one URL per line
			).join('\n\n') // Combine each window's URL list, separating each list with an empty line
		writeToClipboard(output)
		return tabCount
	})
}

const pasteTabs = () => {
	const input = readFromClipboard()
	const urls = getUrls(input, NORMALIZE_URL_OPTIONS)
	for (const url of urls) {
		browser.tabs.create({ url })
	}
	return Promise.resolve(urls.size)
}

// User preferences

const PREFERENCE_NAMES = Object.freeze({
	COPY_SCOPE: 'copyScope',
	INCLUDE_TITLES: 'includeTitles',
})

const storage = browser.storage.sync ? browser.storage.sync : browser.storage.local // use synchronized storage if available

const savePref = (name, value) => {
	storage.set({
		[name]: value
	})
}

const getPrefs = () => {
	return storage.get({
		[PREFERENCE_NAMES.COPY_SCOPE]: 'currentWindow',
		[PREFERENCE_NAMES.INCLUDE_TITLES]: false,
	})
}

module.exports = {
	copyTabs,
	pasteTabs,
	getPrefs,
	savePref,
	PREFERENCE_NAMES,
	ALERT_OPERATIONS,
}
