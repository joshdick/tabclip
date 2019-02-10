const browser = require('webextension-polyfill')
const urlRegex = require('url-regex')

const clipboardBridge = document.querySelector('#clipboardBridge')
clipboardBridge.contentEditable = true

const ALERT_OPERATIONS = Object.freeze({
	COPY: Symbol('copy'),
	PASTE: Symbol('paste')
})

const readFromClipboard = () => {
	let result = ''
	if (navigator.clipboard) {
		result = navigator.clipboard.readText()
	} else {
		// Doesn't work in background pages in Firefox:
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard#Browser-specific_considerations
		clipboardBridge.focus()
		document.execCommand('selectAll')
		document.execCommand('paste')
		result = Promise.resolve(clipboardBridge.innerText)
		clipboardBridge.innerText = ''
	}
	return result
}

const writeToClipboard = (text) => {
	if (navigator.clipboard) {
		return navigator.clipboard.writeText(text)
	} else {
		clipboardBridge.innerText = text
		clipboardBridge.focus()
		document.execCommand('selectAll')
		document.execCommand('copy')
		clipboardBridge.innerText = ''
		return Promise.resolve()
	}
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
		return writeToClipboard(output).then(() => {
			return tabCount
		})
	})
}

const pasteTabs = (inBackground = false) => {
	return readFromClipboard().then((input) => {
		const urls = input.match(urlRegex()) || []
		for (const url of urls) {
			browser.tabs.create({ url, active: !inBackground })
		}
		return Promise.resolve(urls.length)
	})
}

// User preferences

const PREFERENCE_NAMES = Object.freeze({
	BACKGROUND_PASTE: 'backgroundPaste',
	COPY_SCOPE: 'copyScope',
	INCLUDE_TITLES: 'includeTitles',
})

const storage = browser.storage.local

const savePref = (name, value) => {
	storage.set({
		[name]: value
	})
}

const getPrefs = () => {
	return storage.get([
		PREFERENCE_NAMES.BACKGROUND_PASTE,
		PREFERENCE_NAMES.COPY_SCOPE,
		PREFERENCE_NAMES.INCLUDE_TITLES
	])
}

module.exports = {
	copyTabs,
	pasteTabs,
	getPrefs,
	savePref,
	PREFERENCE_NAMES,
	ALERT_OPERATIONS,
}
