const browser = require('webextension-polyfill')
const shared = require('./shared')

const showNotification = async (quantity, operation) => {
	const idSuffix = operation === shared.ALERT_OPERATIONS.COPY ? 'copy' : 'paste'
	const titleVerb = operation === shared.ALERT_OPERATIONS.COPY ? 'Copy' : 'Paste'
	const messageVerb = operation === shared.ALERT_OPERATIONS.COPY ? 'Copied' : 'Pasted'
	await browser.notifications.create(`tabclip-${idSuffix}`, {
		type: 'basic',
		iconUrl: browser.extension.getURL('img/tabclip_128.png'),
		title: `Tabclip ${titleVerb}`,
		message: `${messageVerb} ${quantity} URL${quantity === 1 ? '' : 's'}.`,
	})
}

const commandListener = async (command) => {
	if (command === 'copy-tabs') {
		const {
			[shared.PREFERENCE_NAMES.COPY_SCOPE]: copyScope,
			[shared.PREFERENCE_NAMES.INCLDUE_TITLES]: includeTitles,
		} = await shared.getPrefs()
		const tabCount = await shared.copyTabs(copyScope !== 'allWindows', !!includeTitles)
		await showNotification(tabCount, shared.ALERT_OPERATIONS.COPY)
	} else if (command === 'paste-tabs') {
		const {
			[shared.PREFERENCE_NAMES.BACKGROUND_PASTE]: inBackground,
		} = await shared.getPrefs()
		const tabCount = await shared.pasteTabs(!!inBackground)
		await showNotification(tabCount, shared.ALERT_OPERATIONS.PASTE)
	}
}

if (!browser.commands.onCommand.hasListener(commandListener)) {
	browser.commands.onCommand.addListener(commandListener)
}

