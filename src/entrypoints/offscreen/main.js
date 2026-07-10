import browser from 'webextension-polyfill'
import { createClipboardBridge } from '@/lib/clipboard-dom'

const { readFromClipboard, writeToClipboard } = createClipboardBridge()

browser.runtime.onMessage.addListener((message) => {
	if (message?.type === 'tabclip:clipboard-read') return readFromClipboard()
	if (message?.type === 'tabclip:clipboard-write') return writeToClipboard(message.text)
})
