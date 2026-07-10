import 'bootstrap-css-only/css/bootstrap.min.css'
import '@/lib/fontawesome-icons'
import { copyTabs, pasteTabs } from '@/lib/tabs'
import { getPrefs, savePref, PREFERENCE_NAMES, ALERT_OPERATIONS } from '@/lib/prefs'
import { createClipboardBridge } from '@/lib/clipboard-dom'

const { readFromClipboard, writeToClipboard } = createClipboardBridge()

const alert = document.querySelector('#alert')
const copyButton = document.querySelector('#copyButton')
const pasteButton = document.querySelector('#pasteButton')
const includeTitlesCheckbox = document.querySelector('#includeTitles')
const backgroundPasteCheckbox = document.querySelector('#backgroundPaste')

// Waiting for DOMContentLoaded allows webextension-polyfill to load
document.addEventListener('DOMContentLoaded', async () => {
	const {
		[PREFERENCE_NAMES.COPY_SCOPE]: copyScope,
		[PREFERENCE_NAMES.INCLUDE_TITLES]: includeTitles,
		[PREFERENCE_NAMES.BACKGROUND_PASTE]: backgroundPaste
	} = await getPrefs()
	if (copyScope) document.querySelector(`#${copyScope}`).checked = true
	includeTitlesCheckbox.checked = !!includeTitles
	backgroundPasteCheckbox.checked = !!backgroundPaste
})

const showAlert = async (quantity, operation) => {
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
	await new Promise(resolve => setTimeout(resolve, 3000))
		.then(() => {
			alert.classList.remove(className)
			alert.innerText = ''
		})
}

copyButton.onclick = async () => {
	const currentWindow = document.querySelector('input[name="copyScope"]:checked').value === 'current'
	const includeTitles = includeTitlesCheckbox.checked
	const tabCount = await copyTabs(currentWindow, includeTitles, writeToClipboard)
	await showAlert(tabCount, ALERT_OPERATIONS.COPY)
}

pasteButton.onclick = async () => {
	const inBackground = backgroundPasteCheckbox.checked
	const tabCount = await pasteTabs(inBackground, readFromClipboard)
	await showAlert(tabCount, ALERT_OPERATIONS.PASTE)
}

backgroundPasteCheckbox.onchange = async () => {
	await savePref(PREFERENCE_NAMES.BACKGROUND_PASTE, backgroundPasteCheckbox.checked)
}

includeTitlesCheckbox.onchange = async () => {
	await savePref(PREFERENCE_NAMES.INCLUDE_TITLES, includeTitlesCheckbox.checked)
}

document.querySelectorAll('input[name="copyScope"]')
	.forEach(radioButton => radioButton.onchange = async (event) => {
		await savePref(PREFERENCE_NAMES.COPY_SCOPE, event.target.id)
	})
