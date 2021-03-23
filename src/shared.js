const browser = require('webextension-polyfill')
const urlRegex = require('url-regex-safe')

const clipboardBridge = document.querySelector('#clipboardBridge')
clipboardBridge.contentEditable = true

const ALERT_OPERATIONS = Object.freeze({
	COPY: Symbol('copy'),
	PASTE: Symbol('paste')
})

const readFromClipboard = async () => {
	let result = ''

	clipboardBridge.focus()
	document.execCommand('selectAll')
	document.execCommand('paste')
	result = clipboardBridge.innerText
	clipboardBridge.innerText = ''

	if (!result && navigator.clipboard) {
		try {
			// Can cause Chrome to block without throwing an error,
			// so try it only after attempting the method above
			result = await navigator.clipboard.readText()
		} catch (error) {
			// Disregard any error
		}
	}

	return result
}

const writeToClipboard = async (text) => {
	if (navigator.clipboard) {
		try {
			await navigator.clipboard.writeText(text)
			return
		} catch (error) {
			// Disregard any error; try alternate method below
		}
	}

	clipboardBridge.innerText = text
	clipboardBridge.focus()
	document.execCommand('selectAll')
	document.execCommand('copy')
	clipboardBridge.innerText = ''
}

const copyTabs = async (currentWindow, includeTitles) => {
	// Return an array where each element represents a window,
	// where a window is itself an array where each element is a tab.
	const getTabsByWindow = async () => {
		if (currentWindow) {
			const currentWindowTabs = await browser.tabs.query({ currentWindow })
			return [currentWindowTabs]
		} else {
			const tabsByWindow = []
			const windows = await browser.windows.getAll({ populate: true })
			for (const window of windows) {
				const tabs = []
				for (const tab of window.tabs) {
					tabs.push(tab)
				}
				tabsByWindow.push(tabs)
			}
			return tabsByWindow
		}
	}

	const tabsByWindow = await getTabsByWindow()
	let tabCount = 0
	const output =
		tabsByWindow.map(
			tabs => tabs.map(tab => {
				tabCount += 1
				const title = includeTitles ? ` | ${tab.title}` : ''
				return `${tab.url}${title}`
			}).join('\n') // Combine all tabs for one window into a string, one URL per line
		).join('\n\n') // Combine each window's URL list, separating each list with an empty line
	await writeToClipboard(output)
	return tabCount
}

const pasteTabs = async (inBackground = false) => {
	const input = await readFromClipboard()
	const urls = input.match(urlRegex()) || []
	for (const url of urls) {
		browser.tabs.create({ url, active: !inBackground })
	}
	return urls.length
}

// User preferences

const PREFERENCE_NAMES = Object.freeze({
	BACKGROUND_PASTE: 'backgroundPaste',
	COPY_SCOPE: 'copyScope',
	INCLUDE_TITLES: 'includeTitles',
})

const storage = browser.storage.local

const savePref = async (name, value) => {
	await storage.set({
		[name]: value
	})
}

const getPrefs = async () => {
	const result = await storage.get([
		PREFERENCE_NAMES.BACKGROUND_PASTE,
		PREFERENCE_NAMES.COPY_SCOPE,
		PREFERENCE_NAMES.INCLUDE_TITLES
	])
	return result
}

module.exports = {
	copyTabs,
	pasteTabs,
	getPrefs,
	savePref,
	PREFERENCE_NAMES,
	ALERT_OPERATIONS,
}
