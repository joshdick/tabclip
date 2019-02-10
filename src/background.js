const browser = require('webextension-polyfill')
const shared = require('./shared')

const showNotification = (quantity, operation) => {
	const idSuffix = operation === shared.ALERT_OPERATIONS.COPY ? 'copy' : 'paste'
	const titleVerb = operation === shared.ALERT_OPERATIONS.COPY ? 'Copy' : 'Paste'
	const messageVerb = operation === shared.ALERT_OPERATIONS.COPY ? 'Copied' : 'Pasted'
	browser.notifications.create(`tabclip-${idSuffix}`, {
		type: 'basic',
		iconUrl: browser.extension.getURL('img/tabclip_128.png'),
		title: `Tabclip ${titleVerb}`,
		message: `${messageVerb} ${quantity} URL${quantity === 1 ? '' : 's'}.`,
	})
}

const commandListener = (command) => {
	if (command === 'copy-tabs') {
		shared.getPrefs().then(({
			[shared.PREFERENCE_NAMES.COPY_SCOPE]: copyScope,
			[shared.PREFERENCE_NAMES.INCLDUE_TITLES]: includeTitles,
		}) => {
			shared.copyTabs(copyScope === 'currentWindow', includeTitles)
				.then(tabCount => {
					showNotification(tabCount, shared.ALERT_OPERATIONS.COPY)
				})
		})
	} else if (command === 'paste-tabs') {
		shared.getPrefs().then(({
			[shared.PREFERENCE_NAMES.BACKGROUND_PASTE]: inBackground,
		}) => {
			shared.pasteTabs(inBackground)
				.then(tabCount => {
					showNotification(tabCount, shared.ALERT_OPERATIONS.PASTE)
				})
		})
	}
}

if (!browser.commands.onCommand.hasListener(commandListener)) {
	browser.commands.onCommand.addListener(commandListener)
}

