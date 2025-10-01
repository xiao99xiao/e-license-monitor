# E-License Driving School Reservation Monitor

[中文 (简体) 🇨🇳](README.md) | [English 🇺🇸](README.en.md) | [日本語 🇯🇵](README.ja.md)

## 🚗 Tired of Waiting Weeks for Driving Lessons?

It's incredibly difficult to reserve lessons at Japanese driving schools! Usually, you can only book lessons many days (like one week) in advance. This makes it take forever before you can graduate from driving school.

**This extension solves that problem!** 🎯

- ✅ **Automatic monitoring** every 60 seconds for available slots
- ✅ **Instant notifications** when someone cancels their lesson
- ✅ **Immediate booking** opportunity - reserve it before anyone else!
- ✅ **Faster graduation** - no more waiting weeks for lessons

## 📱 Quick Setup

1. **Install ntfy.sh app** on your mobile device for instant notifications
2. **⚠️ IMPORTANT: Must change channel name!**
   - Default channel `e-license-reserve-alert` is shared
   - You'll receive notifications from other driving school students if not changed
   - Modify it to your unique channel name in `content.js`
3. **Only works** with driving schools that use the e-license.jp system

---

A Chrome extension that monitors e-license.jp websites for available driving lesson slots and sends automatic notifications.

e-license.jp is a solution platform used by multiple Japanese driving schools for their students to book driving lessons.

## Features

- 🔍 **Auto Monitoring**: Monitors driving lesson reservation slots on e-license.jp
- 📱 **Instant Notifications**: Sends notifications via ntfy.sh
- ⚙️ **Configurable Selectors**: Customize monitoring elements and navigation links
- 🔄 **Auto Refresh**: Automatically refreshes page data every 60 seconds
- 📊 **Debug Logging**: Detailed runtime status and error information

## Installation

### 1. Download Extension

```bash
git clone https://github.com/xiao99xiao/e-license-monitor.git
```

### 2. Load into Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked extension"
5. Select the downloaded `checker_chrome` folder

### 3. Configure Notification Service

1. Download [ntfy.sh app](https://ntfy.sh/)
2. Subscribe to topic: `e-license-reserve-alert`
3. Ensure the app is running in the background

**⚠️ IMPORTANT WARNING**: Default notification channel `e-license-reserve-alert` is a **shared channel**! **You MUST change it to your unique channel name**, otherwise you'll receive notifications from other driving school students.

```javascript
xhr.open("POST", "https://ntfy.sh/your-unique-channel-name", true);
```

## Usage

### Detailed Steps

1. **Access Driving School Reservation System**

   - Open browser and visit your driving school's e-license.jp page
   - Log in to your driving school account
   - Navigate to lesson reservation page (Stage 1, Stage 2, or Exam reservation)

2. **Start Monitoring**

   - Click the extension icon (E-License Monitor) in browser toolbar
   - Click "Start Monitor" button in the popup
   - Status shows "Monitoring Active" when monitoring is started
   - Extension will begin monitoring available slots on current page

3. **Monitoring Runtime**

   - Extension checks for slots every 60 seconds automatically
   - Sends notifications via ntfy.sh when slots are found
   - View debug logs in popup to understand runtime status

4. **Stop Monitoring**
   - Click "Stop Monitor" button in extension popup
   - Status shows "Monitoring Stopped" when monitoring is stopped

### Configuration Options

#### Slot Elements Selector

Used to specify elements to monitor for lesson reservation slots, different values needed for different stages (Stage 1, Stage 2, Exam):

- **Default**: `a.simei`
- **Other Examples**:
  - `.available-slots`
  - `[data-slot="available"]`
  - `div.slot-item a`

#### Reservation Link Selector

Used to specify navigation links to lesson reservation pages, different values needed for different stages (Stage 1, Stage 2, Exam):

- **Default**: `a[data-kamoku="0"]`
- **Other Examples**:
  - `.dropdown-menu.show a:nth-child(3)`
  - `a[data-action="/el32/pc/reserv/p06/p06a/nav"]`

#### Configuration Steps

1. Modify selector values in extension popup
2. Click "Save Configuration" to save
3. Restart monitoring to apply new configuration

## Notification Format

When lesson slots are found, notifications are sent in this format:

```
🎉 SLOTS AVAILABLE! 2024-01-15 10:00, 2024-01-15 14:00 😄
```

## Troubleshooting

### Common Issues

**Q: Monitoring not finding lesson slots**

- Check if selector configuration is correct
- View error information in debug logs
- Confirm if webpage element structure has changed

**Q: Not receiving notifications**

- Confirm ntfy.sh app is running
- Check if subscribed to correct channel: `e-license-reserve-alert`
- Check network connection
- View send status in debug logs
- To use custom channel, modify ntfy URL in `content.js`

**Q: Configuration not saving**

- Ensure input selectors are not empty
- Check browser console for errors
- Reload extension

### Debug Information

Extension provides detailed debug information:

- Monitoring status changes
- Element check results
- Notification send status
- Error and warning messages

## Technical Specifications

- **Chrome Extension Version**: Manifest V3
- **Permissions**: `activeTab`, `storage`, `scripting`
- **Supported Websites**: `*.e-license.jp/*`
- **Notification Service**: ntfy.sh
- **Default Notification Channel**: `e-license-reserve-alert`
- **Monitoring Interval**: 60 seconds

### Custom Notification Channel

To use custom ntfy channel:

1. Subscribe to your custom channel in ntfy.sh app
2. Modify ntfy URL in `content.js` file in two places:

   ```javascript
   // In sendAlert function (around line 215)
   xhr.open("POST", "https://ntfy.sh/your-channel-name", true);

   // In sendUrgentAlert function (around line 275)
   xhr.open("POST", "https://ntfy.sh/your-channel-name", true);
   ```

3. Reload extension

## Development Information

### File Structure

```
/
├── manifest.json          # Extension manifest
├── background.js           # Background script
├── content.js             # Content script
├── popup.html             # Popup interface
├── popup.js               # Popup logic
└── images/                # Extension icons
```

### Main Functions

- **Monitoring Flow**: Check page elements → Send notifications → Auto refresh
- **State Management**: Uses Chrome storage API for persistent configuration
- **Message Communication**: Popup ↔ Background script ↔ Content script

## License

This project is licensed under Creative Commons Attribution-NonCommercial 4.0 International License. See [LICENSE](LICENSE) for details.

## Contributing

Pull requests and contributions are welcome! Please ensure your contributions comply with the CC BY-NC license terms.

---

**Note**: This extension only works on e-license.jp websites. Please ensure you have a driving school account and access to the website.
