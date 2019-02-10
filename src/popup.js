require('bootstrap-css-only/css/bootstrap.min.css')
const shared = require('./shared')

const alert = document.querySelector('#alert')
const copyButton = document.querySelector('#copyButton')
const pasteButton = document.querySelector('#pasteButton')
const includeTitlesCheckbox = document.querySelector('#includeTitles')
const backgroundPasteCheckbox = document.querySelector('#backgroundPaste')

// Waiting for DOMContentLoaded allows webextension-polyfill to load
document.addEventListener('DOMContentLoaded', () => {
	shared.getPrefs().then(({
		[shared.PREFERENCE_NAMES.COPY_SCOPE]: copyScope,
		[shared.PREFERENCE_NAMES.INCLUDE_TITLES]: includeTitles,
		[shared.PREFERENCE_NAMES.BACKGROUND_PASTE]: backgroundPaste
	}) => {
		if (copyScope) document.querySelector(`#${copyScope}`).checked = true
		includeTitlesCheckbox.checked = !!includeTitles
		backgroundPasteCheckbox.checked = !!backgroundPaste
	})
})

const showAlert = (quantity, operation) => {
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
	setTimeout(() => {
		alert.classList.remove(className)
		alert.innerText = ''
	}, 3000)
}

copyButton.onclick = () => {
	const currentWindow = document.querySelector('input[name="copyScope"]:checked').value === 'current'
	const includeTitles = includeTitlesCheckbox.checked
	shared.copyTabs(currentWindow, includeTitles)
		.then(tabCount => {
			showAlert(tabCount, shared.ALERT_OPERATIONS.COPY)
		})
}

pasteButton.onclick = () => {
	const inBackground = backgroundPasteCheckbox.checked
	shared.pasteTabs(inBackground)
		.then(tabCount => {
			showAlert(tabCount, shared.ALERT_OPERATIONS.PASTE)
		})
}

backgroundPasteCheckbox.onchange = () => {
	shared.savePref(shared.PREFERENCE_NAMES.BACKGROUND_PASTE, backgroundPasteCheckbox.checked)
}

includeTitlesCheckbox.onchange = () => {
	shared.savePref(shared.PREFERENCE_NAMES.INCLUDE_TITLES, includeTitlesCheckbox.checked)
}

document.querySelectorAll('input[name="copyScope"]')
	.forEach(radioButton => radioButton.onchange = (event) => {
		shared.savePref(shared.PREFERENCE_NAMES.COPY_SCOPE, event.target.id)
	})
