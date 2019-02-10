require('bootstrap-css-only/css/bootstrap.min.css')
const shared = require('./shared')

const alert = document.querySelector('#alert')
const copyButton = document.querySelector('#copyButton')
const pasteButton = document.querySelector('#pasteButton')
const includeTitlesCheckbox = document.querySelector('#includeTitles')
const backgroundPasteCheckbox = document.querySelector('#backgroundPaste')

// Waiting for DOMContentLoaded allows webextension-polyfill to load
document.addEventListener('DOMContentLoaded', async () => {
	const {
		[shared.PREFERENCE_NAMES.COPY_SCOPE]: copyScope,
		[shared.PREFERENCE_NAMES.INCLUDE_TITLES]: includeTitles,
		[shared.PREFERENCE_NAMES.BACKGROUND_PASTE]: backgroundPaste
	} = await shared.getPrefs()
	if (copyScope) document.querySelector(`#${copyScope}`).checked = true
	includeTitlesCheckbox.checked = !!includeTitles
	backgroundPasteCheckbox.checked = !!backgroundPaste
})

const showAlert = async (quantity, operation) => {
	let verb
	switch (operation) {
	case shared.ALERT_OPERATIONS.COPY:
		verb = 'Copied'
		break
	case shared.ALERT_OPERATIONS.PASTE:
		verb = 'Pasted'
		break
	}
	alert.innerText = `${verb} ${quantity} URL${quantity === 1 ? '' : 's'}.`
	const className = 'show'
	alert.classList.add(className)
	await (() => new Promise(resolve => setTimeout(resolve, 3000)))()
	alert.classList.remove(className)
	alert.innerText = ''
}

copyButton.onclick = async () => {
	const currentWindow = document.querySelector('input[name="copyScope"]:checked').value === 'current'
	const includeTitles = includeTitlesCheckbox.checked
	const tabCount = await shared.copyTabs(currentWindow, includeTitles)
	await showAlert(tabCount, shared.ALERT_OPERATIONS.COPY)
}

pasteButton.onclick = async () => {
	const inBackground = backgroundPasteCheckbox.checked
	const tabCount = await shared.pasteTabs(inBackground)
	await showAlert(tabCount, shared.ALERT_OPERATIONS.PASTE)
}

backgroundPasteCheckbox.onchange = async () => {
	await shared.savePref(shared.PREFERENCE_NAMES.BACKGROUND_PASTE, backgroundPasteCheckbox.checked)
}

includeTitlesCheckbox.onchange = async () => {
	await shared.savePref(shared.PREFERENCE_NAMES.INCLUDE_TITLES, includeTitlesCheckbox.checked)
}

document.querySelectorAll('input[name="copyScope"]')
	.forEach(radioButton => radioButton.onchange = async (event) => {
		await shared.savePref(shared.PREFERENCE_NAMES.COPY_SCOPE, event.target.id)
	})
