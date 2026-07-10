import browser from 'webextension-polyfill'
import urlRegex from 'url-regex-safe'

export const copyTabs = async (currentWindow, includeTitles, writeToClipboard) => {
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

export const pasteTabs = async (inBackground = false, readFromClipboard) => {
	const input = await readFromClipboard()
	const urls = (input || '').match(urlRegex()) || []
	for (const url of urls) {
		browser.tabs.create({ url, active: !inBackground })
	}
	return urls.length
}
