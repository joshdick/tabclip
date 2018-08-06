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

browser.commands.onCommand.addListener((command) => {
	if (command === 'copy-tabs') {
		shared.getPrefs().then(({ copyScope, includeTitles }) => {
			shared.copyTabs(copyScope === 'currentWindow', includeTitles)
				.then(tabCount => {
					showNotification(tabCount, shared.ALERT_OPERATIONS.COPY)
				})
		})
	} else if (command === 'paste-tabs') {
		shared.pasteTabs()
			.then(tabCount => {
				showNotification(tabCount, shared.ALERT_OPERATIONS.PASTE)
			})
	}
})

