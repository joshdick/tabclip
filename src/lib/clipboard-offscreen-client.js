import browser from 'webextension-polyfill'
import { CLIPBOARD_MESSAGE_TYPES } from '@/lib/clipboard-messages'

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
	try {
		await creating
	} finally {
		creating = undefined
	}
}

// Chrome's sendMessage resolves to undefined (rather than rejecting) when no
// listener responds in time, e.g. if the offscreen document's listener isn't
// registered yet or the document is being torn down. Treat a missing response
// as a real failure instead of silently propagating undefined to the caller.
const sendClipboardMessage = async (message) => {
	const response = await browser.runtime.sendMessage(message)
	if (!response) throw new Error(`No response from offscreen document for message type "${message.type}"`)
	return response
}

const withOffscreenDocument = async (fn) => {
	await ensureOffscreenDocument()
	try {
		return await fn()
	} finally {
		await browser.offscreen.closeDocument()
	}
}

export const createOffscreenClipboardClient = () => ({
	readFromClipboard: () => withOffscreenDocument(async () => {
		const { text } = await sendClipboardMessage({ type: CLIPBOARD_MESSAGE_TYPES.READ })
		return text
	}),
	writeToClipboard: (text) => withOffscreenDocument(() =>
		sendClipboardMessage({ type: CLIPBOARD_MESSAGE_TYPES.WRITE, text })
	),
})
