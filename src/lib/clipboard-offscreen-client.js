import browser from 'webextension-polyfill'

let creating // dedupe concurrent createDocument calls

const ensureOffscreenDocument = async () => {
	if (await browser.offscreen.hasDocument()) return
	if (!creating) {
		creating = browser.offscreen.createDocument({
			url: 'offscreen.html',
			reasons: ['CLIPBOARD'],
			justification: 'Read/write the clipboard for the copy-tabs/paste-tabs keyboard shortcuts',
		})
	}
	await creating
	creating = undefined
}

export const createOffscreenClipboardClient = () => ({
	readFromClipboard: async () => {
		await ensureOffscreenDocument()
		return browser.runtime.sendMessage({ type: 'tabclip:clipboard-read' })
	},
	writeToClipboard: async (text) => {
		await ensureOffscreenDocument()
		await browser.runtime.sendMessage({ type: 'tabclip:clipboard-write', text })
	},
})
