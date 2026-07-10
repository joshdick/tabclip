export const createClipboardBridge = () => {
	const clipboardBridge = document.createElement('div')
	clipboardBridge.contentEditable = true
	clipboardBridge.style.position = 'absolute'
	clipboardBridge.style.top = '-1000px'
	document.body.appendChild(clipboardBridge)

	const readFromClipboard = async () => {
		// In an offscreen document, nothing is ever visibly focused by the user;
		// requesting window focus first improves the odds that execCommand
		// below can actually reach the system clipboard.
		window.focus()
		clipboardBridge.focus()
		document.execCommand('selectAll')
		document.execCommand('paste')
		let result = clipboardBridge.innerText
		clipboardBridge.innerText = ''

		if (!result && navigator.clipboard) {
			try {
				// Can cause Chrome to block without throwing an error,
				// so try it only after attempting the method above
				result = await navigator.clipboard.readText()
			} catch {
				// Disregard any error
			}
		}

		return result
	}

	const writeToClipboard = async (text) => {
		if (navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(text)
				return
			} catch {
				// Disregard any error; try alternate method below
			}
		}

		clipboardBridge.innerText = text
		window.focus()
		clipboardBridge.focus()
		document.execCommand('selectAll')
		document.execCommand('copy')
		clipboardBridge.innerText = ''
	}

	return { readFromClipboard, writeToClipboard }
}
