// ==UserScript==
// @name         Anti Anti-Debug (Aggressive)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Aggressively neutralize debugger traps and anti-debugging techniques
// @author       edideaur
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @homepageURL  https://prigoana.com/
// @supportURL   https://github.com/edideaur/anti-anti-debug
// @downloadURL  https://github.com/edideaur/anti-anti-debug/raw/main/anti-anti-debug.user.js
// @updateURL    https://github.com/edideaur/anti-anti-debug/raw/main/anti-anti-debug.user.js
// ==/UserScript==

(function () {
    'use strict';

    const noop = function () {};
    const clean = s => typeof s === "string" ? s.replace(/debugger;?/g, "") : s;

    const OFunction = Function;
    window.Function = function (...a) {
        try {
            let c = a.join(" ");
            if (c.includes("debugger")) return noop;
            return OFunction.apply(this, a);
        } catch {
            return noop;
        }
    };

    const OEval = window.eval;
    window.eval = function (c) {
        try {
            if (typeof c === "string" && c.includes("debugger")) {
                c = clean(c);
            }
            return OEval(c);
        } catch {
            return null;
        }
    };

    const wrapTimer = (orig) => function (fn, t, ...a) {
        try {
            if (typeof fn === "string") fn = clean(fn);
            else if (typeof fn === "function" && fn.toString().includes("debugger")) {
                return orig(noop, t, ...a);
            }
            return orig(fn, t, ...a);
        } catch {
            return orig(noop, t, ...a);
        }
    };

    window.setTimeout = wrapTimer(window.setTimeout);
    window.setInterval = wrapTimer(window.setInterval);

    console.clear = function () {};

    Object.defineProperty(window, "outerWidth", {
        get() { return window.innerWidth; }
    });

    Object.defineProperty(window, "outerHeight", {
        get() { return window.innerHeight; }
    });

    const blockGetter = (obj, prop, val) => {
        try {
            Object.defineProperty(obj, prop, {
                get: () => val,
                set: noop,
                configurable: true
            });
        } catch {}
    };

    blockGetter(navigator, "webdriver", false);

    const OAdd = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, opts) {
        try {
            if (typeof listener === "function" && listener.toString().includes("debugger")) return;
        } catch {}
        return OAdd.call(this, type, listener, opts);
    };

    const ODefine = Object.defineProperty;
    Object.defineProperty = function (obj, prop, desc) {
        try {
            if (desc && typeof desc.value === "function") {
                if (desc.value.toString().includes("debugger")) desc.value = noop;
            }
        } catch {}
        return ODefine(obj, prop, desc);
    };

    const cleanScripts = () => {
        document.querySelectorAll("script").forEach(s => {
            try {
                if (s.textContent && s.textContent.includes("debugger")) {
                    s.textContent = clean(s.textContent);
                }
            } catch {}
        });
    };

    new MutationObserver(cleanScripts).observe(document, {
        childList: true,
        subtree: true
    });

    cleanScripts();

})();
