require('bootstrap-css-only/css/bootstrap.min.css')

const shared = require('./shared')

const alert = document.querySelector('#alert')
const copyButton = document.querySelector('#copyButton')
const pasteButton = document.querySelector('#pasteButton')
const currentWindowRadio = document.querySelector('#currentWindow')
const allWindowsRadio = document.querySelector('#allWindows')
const includeTitlesCheckbox = document.querySelector('#includeTitles')

currentWindowRadio.onclick = (e) => shared.savePref(shared.PREFERENCE_NAMES.COPY_SCOPE, e.target.id)
allWindowsRadio.onclick = (e) => shared.savePref(shared.PREFERENCE_NAMES.COPY_SCOPE, e.target.id)
includeTitlesCheckbox.onclick = (e) => shared.savePref(shared.PREFERENCE_NAMES.INCLUDE_TITLES, e.target.checked)
shared.getPrefs().then(({ copyScope, includeTitles }) => {
	document.querySelector(`#${copyScope}`).checked = true
	includeTitlesCheckbox.checked = includeTitles
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
	const includeTitles = document.querySelector('#includeTitles').checked
	shared.copyTabs(currentWindow, includeTitles)
		.then(tabCount => {
			showAlert(tabCount, shared.ALERT_OPERATIONS.COPY)
		})
}

pasteButton.onclick = () => {
	shared.pasteTabs()
		.then(tabCount => {
			showAlert(tabCount, shared.ALERT_OPERATIONS.PASTE)
		})
}
