import browser from 'webextension-polyfill'
import { createClipboardBridge } from '@/lib/clipboard-dom'
import { CLIPBOARD_MESSAGE_TYPES } from '@/lib/clipboard-messages'

const { readFromClipboard, writeToClipboard } = createClipboardBridge()

browser.runtime.onMessage.addListener((message) => {
	if (message?.type === CLIPBOARD_MESSAGE_TYPES.READ) {
		return readFromClipboard().then(text => ({ text }))
	}
	if (message?.type === CLIPBOARD_MESSAGE_TYPES.WRITE) {
		return writeToClipboard(message.text).then(() => ({ ok: true }))
	}
})
