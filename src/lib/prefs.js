import browser from 'webextension-polyfill'

export const ALERT_OPERATIONS = Object.freeze({
	COPY: Symbol('copy'),
	PASTE: Symbol('paste')
})

export const PREFERENCE_NAMES = Object.freeze({
	BACKGROUND_PASTE: 'backgroundPaste',
	COPY_SCOPE: 'copyScope',
	INCLUDE_TITLES: 'includeTitles',
})

const storage = browser.storage.local

export const savePref = async (name, value) => {
	await storage.set({
		[name]: value
	})
}

export const getPrefs = async () => {
	const result = await storage.get([
		PREFERENCE_NAMES.BACKGROUND_PASTE,
		PREFERENCE_NAMES.COPY_SCOPE,
		PREFERENCE_NAMES.INCLUDE_TITLES
	])
	return result
}
