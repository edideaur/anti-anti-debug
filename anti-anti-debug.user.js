// ==UserScript==
// @name         Disable Debugger Traps (Aggressive)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Aggressively neutralize debugger traps and anti-debugging techniques
// @author       edideaur
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @homepageURL  https://prigoana.com/
// @supportURL   https://github.com/edideaur/anti-anti-debug
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
        } catch (e) {
            return noop;
        }
    };

    const OEval = window.eval;
    window.eval = function (c) {
        try {
            if (typeof c === "string") {
                if (c.includes("debugger")) c = clean(c);
            }
            return OEval(c);
        } catch (e) {
            return null;
        }
    };

    const wrapTimer = (orig) => function (fn, t, ...a) {
        try {
            if (typeof fn === "string") fn = clean(fn);
            else if (typeof fn === "function") {
                const src = fn.toString();
                if (src.includes("debugger")) return orig(noop, t, ...a);
            }
            return orig(fn, t, ...a);
        } catch (e) {
            return orig(noop, t, ...a);
        }
    };

    window.setTimeout = wrapTimer(window.setTimeout);
    window.setInterval = wrapTimer(window.setInterval);

    const ORAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function (cb) {
        return ORAF(function (t) {
            try {
                return cb(t);
            } catch (e) {}
        });
    };

    console.clear = function () {};

    const OLog = console.log.bind(console);
    console.log = function (...a) {
        return OLog(...a);
    };

    Object.defineProperty(window, "outerWidth", {
        get() {
            return window.innerWidth;
        }
    });

    Object.defineProperty(window, "outerHeight", {
        get() {
            return window.innerHeight;
        }
    });

    const blockGetter = (obj, prop, val) => {
        try {
            Object.defineProperty(obj, prop, {
                get: () => val,
                set: noop,
                configurable: true
            });
        } catch (e) {}
    };

    blockGetter(navigator, "webdriver", false);

    const antiDebugDelay = () => {
        const t0 = performance.now();
        debugger;
        const t1 = performance.now();
        return t1 - t0;
    };

    setInterval(() => {
        try {
            if (antiDebugDelay() > 100) {
            }
        } catch (e) {}
    }, 1000);

    const OAddEventTarget = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, opts) {
        try {
            if (typeof listener === "function") {
                const src = listener.toString();
                if (src.includes("debugger")) return;
            }
        } catch (e) {}
        return OAddEventTarget.call(this, type, listener, opts);
    };

    const ODefine = Object.defineProperty;
    Object.defineProperty = function (obj, prop, desc) {
        try {
            if (desc && typeof desc.value === "function") {
                const src = desc.value.toString();
                if (src.includes("debugger")) desc.value = noop;
            }
        } catch (e) {}
        return ODefine(obj, prop, desc);
    };

    const OProxy = Proxy;
    window.Proxy = new OProxy(OProxy, {
        construct(t, args) {
            try {
                const [target, handler] = args;
                return new t(target, {
                    get(...a) {
                        try {
                            return handler.get ? handler.get(...a) : Reflect.get(...a);
                        } catch (e) {}
                    },
                    apply(...a) {
                        try {
                            return handler.apply ? handler.apply(...a) : Reflect.apply(...a);
                        } catch (e) {}
                    }
                });
            } catch (e) {
                return new t(...args);
            }
        }
    });

    const injectCleaner = () => {
        const scripts = document.querySelectorAll("script");
        for (const s of scripts) {
            try {
                if (s.textContent && s.textContent.includes("debugger")) {
                    s.textContent = clean(s.textContent);
                }
            } catch (e) {}
        }
    };

    const mo = new MutationObserver(injectCleaner);
    mo.observe(document, {
        childList: true,
        subtree: true
    });

    injectCleaner();

    window.addEventListener("keydown", e => {
        if (
            e.key === "F12" ||
            e.key === "F5" ||
            (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C"))
        ) {
            e.stopPropagation();
        }
    }, true);

})();
