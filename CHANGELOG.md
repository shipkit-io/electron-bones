# Changelog

## Unreleased

### Bug Fixes (backfilled from CrossOver v4)

- **Auto-update `setProgressBar` on destroyed window** — Added `!isDestroyed()` checks before calling `setProgressBar` in download progress and update-downloaded handlers.
- **Auto-update listener accumulation** — Added `listenersRegistered` guard and single polling interval in the `update()` template code (currently commented out) to prevent listener stacking when uncommented.
- **Keyboard shortcut registration failure** — `globalShortcut.unregisterAll()` was called before building the new shortcut list. If `register()` threw mid-way, all shortcuts were lost. Fixed by collecting shortcuts first, then swapping atomically with per-shortcut try-catch.
- **IPC listener cleanup leak in renderer** — `removeAllListeners()` was used in `GlobalContextProvider` cleanup instead of the unsubscribe functions returned by `ipcRenderer.on()`. Fixed by storing and calling unsubscribe functions.
- **Stale `settings.allowSounds` closure** — The PLAY_SOUND listener captured `settings.allowSounds` at effect registration time, so toggling sounds had no effect until remount. Fixed by fetching latest settings via IPC when a sound plays.
- **IPC sent to destroyed windows** — `synchronizeApp()` sent IPC messages to all windows without checking if they were destroyed. Added `!win.isDestroyed()` guard.
- **Missing `ipcChannels` import in create-window** — `WINDOW_MAXIMIZED_CHANGE` channel was used without importing `ipcChannels`.

## 3.1.0

### Features

- **Windows maximize/snap support** — Disable transparency on Windows (strips WS_THICKFRAME, breaks maximize/snap), set `frame: true` for `titleBarStyle` + `titleBarOverlay`, add IPC handlers for window controls (minimize/maximize/close/isMaximized), add `WINDOW_MAXIMIZED_CHANGE` channel for titlebar state sync.
- **Security hardening** — Explicitly set `contextIsolation: true` and `nodeIntegration: false` in webPreferences.

### Improvements

- Backfill improvements from cinematic downstream: sound system, cleanup, and refactoring.

## 3.0.0

Rebuild from scratch using Electron and React. This is a complete rewrite of the original app.
