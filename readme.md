# Anti Anti-Debug

A userscript suite designed to neutralize common `debugger` traps and basic anti-debugging techniques used by websites.

This project provides two versions:
- Lite (safe, minimal interference)
- Aggressive (full bypass, may break sites)

---

## Installation

Install a userscript manager:
- Violentmonkey (recommended)
- Tampermonkey 

Then install one of the versions below.

---

## Lite Version

**Recommended for daily use**

### Install
https://github.com/edideaur/anti-anti-debug/raw/main/anti-anti-debug-lite.user.js

### Features
- Removes `debugger` from `eval`
- Cleans `setTimeout` / `setInterval`
- Disables `console.clear`
- Minimal impact on page behavior

### Use when
- You want stability
- You browse normally
- You need basic protection from debugger traps

---

## Aggressive Version

**Advanced mode (may break websites)**

### Install
https://github.com/edideaur/anti-anti-debug/raw/main/anti-anti-debug.user.js

### Features
- Hooks `Function` constructor
- Patches `eval`
- Filters timer-based execution
- Blocks debugger-based event listeners
- Removes `debugger` from injected scripts
- Overrides detection-related properties
- Attempts to bypass anti-debug timing checks

### Use when
- Reverse engineering scripts
- Working with heavily protected sites
- You accept possible breakage

---

## Warnings

- Aggressive mode may break websites
- Some protections may trigger unexpected behavior
- Not intended for bypassing paid or restricted services
- Use responsibly

---

## How it works

The script targets common anti-debugging patterns:

- `debugger;` statements injected dynamically
- `eval()` based traps
- `Function()` constructor injection
- timer-based debugger loops
- event listener inspection
- basic DevTools detection tricks
