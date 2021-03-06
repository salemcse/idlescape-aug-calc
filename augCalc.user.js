// ==UserScript==
// @name         IdleScape - Augment Calculator
// @namespace    GXandarG
// @version      0.0.1
// @description  Augment Calculator - Using Mac15001900 formula (https://mac15001900.github.io/idlescape-calc/)
// @author       GxandarG
// @match        *://*.idlescape.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/salemcse/idlescape-aug-calc/main/augCalc.user.js
// @downloadURL  https://raw.githubusercontent.com/salemcse/idlescape-aug-calc/main/augCalc.user.js
// @require      https://raw.githubusercontent.com/HighOnMikey/idlescape-data/main/src/data.js
// @require      https://raw.githubusercontent.com/salemcse/idlescape-aug-calc/main/augCalc.js
// @require      https://raw.githubusercontent.com/salemcse/idlescape-aug-calc/main/extensions/tooltips.js
// @require      https://raw.githubusercontent.com/salemcse/idlescape-aug-calc/main/extensions/ui.js
// @run-at document-start
// ==/UserScript==

IdlescapeDatabase.createDefault();
(function () {
    window.augCalc = new augCalc();
    window.addEventListener("load", function _() {
        window.augCalc.loadExtensions();
        window.removeEventListener("load", _);
    });
})();