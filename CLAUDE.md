# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension called "E-License Monitor" that monitors the e-license.jp website for available appointment slots. The extension consists of:

- **Background script** (`background.js`): Service worker that handles extension lifecycle and message passing
- **Content script** (`content.js`): Monitors DOM for elements with class "simei" and handles page automation
- **Popup UI** (`popup.html` + `popup.js`): Extension popup interface for starting/stopping monitoring

## Core Architecture

### Monitoring Flow

1. User starts monitoring via popup UI
2. Content script searches for `a.simei` elements on e-license.jp pages
3. When slots found, extracts time/date/week data and sends alerts via ntfy.sh
4. Performs automated UI interactions (dropdown navigation) to refresh data
5. Implements 60-second cycle with duplicate message prevention

### Key Components

- **State Management**: Uses `chrome.storage.local` for persistence across sessions
- **Alert System**: Sends notifications to `https://ntfy.sh/e-license-reserve-alert` with Chinese text and emojis
- **Debug Logging**: Maintains rolling log of 30 entries with timestamps
- **UI Automation**: Clicks navigation elements to refresh page data

### Message Communication

- Background ↔ Content: Element found/not found, monitoring status updates
- Popup ↔ Background/Content: Start/stop monitoring commands
- All messages include detailed debug information for troubleshooting

## Development Commands

This is a vanilla Chrome extension with no build system. Development involves:

- **Loading Extension**: Use Chrome's developer mode to load unpacked extension
- **Testing**: Manual testing on e-license.jp domain required
- **Debugging**: Check browser console and extension popup debug info

## File Structure

```
/
├── manifest.json          # Chrome extension manifest (v3)
├── background.js           # Service worker for extension lifecycle
├── content.js             # DOM monitoring and page automation
├── popup.html             # Extension popup UI
├── popup.js               # Popup interface logic
└── images/                # Extension icons (16px, 48px, 128px)
```

## Important Notes

- Extension only works on `*.e-license.jp/*` domains (enforced in manifest)
- Uses Manifest V3 service worker architecture
- Implements duplicate notification prevention via message comparison
- All alert messages are in Chinese with emoji indicators
- Debug logs are limited to 30 entries and auto-truncate
