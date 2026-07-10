import browser from 'webextension-polyfill'
import { copyTabs, pasteTabs } from '@/lib/tabs'
import { getPrefs, PREFERENCE_NAMES, ALERT_OPERATIONS } from '@/lib/prefs'
import { createClipboardBridge } from '@/lib/clipboard-dom'
import { createOffscreenClipboardClient } from '@/lib/clipboard-offscreen-client'

export default defineBackground(() => {
	// Firefox's MV3 background is still a DOM-having event page, so the direct
	// DOM clipboard bridge works there. Chrome's MV3 background is a real
	// service worker with no DOM, so clipboard access is delegated to an
	// offscreen document instead.
	const { readFromClipboard, writeToClipboard } = import.meta.env.FIREFOX
		? createClipboardBridge()
		: createOffscreenClipboardClient()

	const showNotification = async (quantity, operation) => {
		const idSuffix = operation === ALERT_OPERATIONS.COPY ? 'copy' : 'paste'
		const titleVerb = operation === ALERT_OPERATIONS.COPY ? 'Copy' : 'Paste'
		const messageVerb = operation === ALERT_OPERATIONS.COPY ? 'Copied' : 'Pasted'
		await browser.notifications.create(`tabclip-${idSuffix}`, {
			type: 'basic',
			iconUrl: browser.runtime.getURL('icon/128.png'),
			title: `Tabclip ${titleVerb}`,
			message: `${messageVerb} ${quantity} URL${quantity === 1 ? '' : 's'}.`,
		})
	}

	const commandListener = async (command) => {
		if (command === 'copy-tabs') {
			const {
				[PREFERENCE_NAMES.COPY_SCOPE]: copyScope,
				[PREFERENCE_NAMES.INCLUDE_TITLES]: includeTitles,
			} = await getPrefs()
			const tabCount = await copyTabs(copyScope !== 'allWindows', !!includeTitles, writeToClipboard)
			await showNotification(tabCount, ALERT_OPERATIONS.COPY)
		} else if (command === 'paste-tabs') {
			const {
				[PREFERENCE_NAMES.BACKGROUND_PASTE]: inBackground,
			} = await getPrefs()
			const tabCount = await pasteTabs(!!inBackground, readFromClipboard)
			await showNotification(tabCount, ALERT_OPERATIONS.PASTE)
		}
	}

	if (!browser.commands.onCommand.hasListener(commandListener)) {
		browser.commands.onCommand.addListener(commandListener)
	}
})
