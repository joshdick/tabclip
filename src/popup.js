const getUrls = require('get-urls')

const copyButton = document.querySelector('#copyButton')
const pasteButton = document.querySelector('#pasteButton')
const alert = document.querySelector('#alert')

const copyToClipboard = (text) => {
	const copyDiv = document.createElement('div')
	copyDiv.contentEditable = true
	copyDiv.setAttribute('style', 'white-space: pre; position: absolute; top: 10000px;') // preserve line breaks and prevent UI reflows
	document.body.appendChild(copyDiv)
	copyDiv.innerText = text
	copyDiv.unselectable = 'off'
	copyDiv.focus()
	document.execCommand('SelectAll')
	document.execCommand('Copy', false, null)
	document.body.removeChild(copyDiv)
}

const readClipboard = () => {
	const pasteDiv = document.createElement('div')
	pasteDiv.contentEditable = true
	pasteDiv.setAttribute('style', 'white-space: pre; position: absolute; top: 10000px;') // preserve line breaks and prevent UI reflows
	document.body.appendChild(pasteDiv)
	pasteDiv.unselectable = 'off'
	pasteDiv.focus()
	document.execCommand('SelectAll')
	document.execCommand('Paste', false, null)
	const result = pasteDiv.innerText
	document.body.removeChild(pasteDiv)
	return result
}

const ALERT_OPERATIONS = Object.freeze({
	COPY: Symbol('copy'),
	PASTE: Symbol('paste')
})

const showAlert = (quantity, operation) => {
	let verb
	switch (operation) {
	case ALERT_OPERATIONS.COPY:
		verb = 'Copied'
		break
	case ALERT_OPERATIONS.PASTE:
		verb = 'Pasted'
		break
	}
	alert.innerText = `${verb} ${quantity} URL${quantity === 1 ? '' : 's'}.`
	const className = 'show'
	alert.classList.add(className)
	setTimeout(() => {
		alert.classList.remove(className)
		alert.innerText = ''
	}, 3000)
}

copyButton.onclick = () => {
	const currentWindow = document.querySelector('input[name="copyScope"]:checked').value === 'current'
	const includeTitles = document.querySelector('#includeTitles').checked
	let copyOperation
	if (currentWindow) {
		copyOperation = () => browser.tabs.query({ currentWindow }).then((tabs) => {
			const output = tabs.map(tab => {
				const title = includeTitles ? ` | ${tab.title}` : ''
				return `${tab.url}${title}`
			}).join('\n') // Combine all tabs for this window into a string, one URL per line
			copyToClipboard(output)
			return tabs.length
		})
	} else {
		let tabsByWindow = [] // Array of arrays where each inner array corresponds to the tabs in a given window
		let tabCount = 0
		copyOperation = () => browser.windows.getAll({ populate: true }).then((windows) => {
			for (const window of windows) {
				const tabs = []
				for (const tab of window.tabs) {
					tabs.push(tab)
					tabCount += 1
				}
				tabsByWindow.push(tabs)
			}
			const output =
				tabsByWindow.map(
					tabs => tabs.map(tab => {
						const title = includeTitles ? ` | ${tab.title}` : ''
						return `${tab.url}${title}`
					}).join('\n') // Combine all tabs for one window into a string, one URL per line
				)
					.join('\n\n') // Combine each window's URL list, separating each list with an empty line
			copyToClipboard(output)
			return tabCount
		})
	}
	copyOperation().then(tabCount => {
		showAlert(tabCount, ALERT_OPERATIONS.COPY)
	})
}

pasteButton.onclick = () => {
	const input = readClipboard()
	const urls = getUrls(input)
	for (const url of urls) {
		browser.tabs.create({ url })
	}
	showAlert(urls.size, ALERT_OPERATIONS.PASTE)
}
