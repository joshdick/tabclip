# tabclip

<img src="https://raw.githubusercontent.com/joshdick/tabclip/master/assets/screenshot.png" title="Tabclip screenshot" alt="Tabclip screenshot" width="1280" />

Copy browser tabs to (or create them from) your clipboard.

Get the extension:

<a href="https://addons.mozilla.org/en-US/firefox/addon/tabclip/">
	<img src="https://raw.githubusercontent.com/joshdick/tabclip/master/assets/firefox.png" title="Firefox logo" alt="Firefox logo" width="150" />
</a>
<a href="https://chrome.google.com/webstore/detail/tabclip/kdmfphcdeckocjmkmkgffgehadjhmkmc">
	<img src="https://raw.githubusercontent.com/joshdick/tabclip/master/assets/chrome.png" title="Chrome logo" alt="Chrome logo" width="150" />
</a>

## About

Tabclip is a web browser extension for Mozilla Firefox and Google Chrome that allows you to copy browser tabs to (or create them from) your clipboard.

The "Copy" button, or keyboard shortcut CTRL+SHIFT+C by default, copies tab URLs to your clipboard.

The "Paste" button, or keyboard shortcut CTRL+SHIFT+V by default, attempts to find all URLs that appear in your clipboard, then opens each URL in a new browser tab.

That's it!

## Feedback

If you have suggestions or bug reports for tabclip, I am much more likely to see your feedback if you leave it at [tabclip's GitHub Issues page](https://github.com/joshdick/tabclip/issues) rather than on tabclip's Firefox Add-Ons or Chrome Web Store pages.

I'd like to keep this extension as simple and minimal as possible, so most feature requests are not likely to be honored.

## Development

To build tabclip for both Firefox and Chrome, install the latest versions of NodeJS and `npm`, then do the following:

```bash
git clone https://github.com/joshdick/tabclip.git
cd tabclip
npm install
npx webpack
```

The build will create a `tabclip.zip` extension archive in the `dist/` directory.

## Attribution

Tabclip is heavily inspired by Vincent Paré's ["Copy All Urls" Chrome extension](https://chrome.google.com/webstore/detail/copy-all-urls/djdmadneanknadilpjiknlnanaolmbfk). I created tabclip because I wanted a similar extension that looked and worked the same in both Chrome and Firefox. Tabclip was written from scratch and shares no code with the "Copy All Urls" Chrome extension.

Tabclip's [icon](https://www.flaticon.com/free-icon/design-tab_68369) was made by [Freepik](https://www.flaticon.com/authors/freepik) from [flaticon.com](https://www.flaticon.com/).
