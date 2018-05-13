import 'bootstrap-css-only/css/bootstrap.min.css';

import webextension_polyfill from 'webextension-polyfill';
if (typeof browser === "undefined") {
	window.browser = webextension_polyfill;
}

import './popup.js';
