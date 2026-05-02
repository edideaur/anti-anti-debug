// ==UserScript==
// @name         Anti Anti-Debug (Lite)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Disable common debugger traps with minimal breakage
// @author       edideaur
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @homepageURL  https://prigoana.com/
// @supportURL   https://github.com/edideaur/anti-anti-debug
// @downloadURL  https://github.com/edideaur/anti-anti-debug/raw/main/anti-anti-debug-lite.user.js
// @updateURL    https://github.com/edideaur/anti-anti-debug/raw/main/anti-anti-debug-lite.user.js
// ==/UserScript==

(function () {
    'use strict';

    const clean = s => typeof s === "string" ? s.replace(/debugger;?/g, "") : s;

    const OEval = window.eval;
    window.eval = function (c) {
        if (typeof c === "string" && c.includes("debugger")) {
            c = clean(c);
        }
        return OEval(c);
    };

    const wrapTimer = (orig) => function (fn, t, ...a) {
        if (typeof fn === "string") fn = clean(fn);
        return orig(fn, t, ...a);
    };

    window.setTimeout = wrapTimer(window.setTimeout);
    window.setInterval = wrapTimer(window.setInterval);

    console.clear = function () {};

})();
