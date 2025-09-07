# LeetMode 🚀

A Chrome extension that helps you stay focused on LeetCode practice by blocking distracting websites during your coding sessions.

## Features

### 🎯 **Focus Mode**
- **Immediate Sessions**: Start a focused coding session instantly with custom duration
- **Website Blocking**: Automatically redirects all non-LeetCode websites to LeetCode during active sessions
- **Smart Redirection**: Only blocks main frame navigation, allowing LeetCode to function normally

### 📅 **Scheduled Practice**
- **Recurring Schedules**: Set up daily or weekly practice schedules
- **Flexible Timing**: Choose specific days and time ranges for your practice sessions
- **Multiple Time Slots**: Add multiple practice periods per day
- **Auto-Activation**: Sessions start automatically based on your schedule

### 🔔 **Smart Notifications**
- **Session Alerts**: Get notified when sessions start and end
- **Visual Feedback**: Clear indicators of active sessions and remaining time
- **Status Updates**: Real-time countdown of remaining session time

### 💾 **Persistent State**
- **Session Continuity**: Active sessions persist across browser restarts
- **Reliable Blocking**: State is saved to storage to prevent interruptions
- **Automatic Cleanup**: Expired sessions are automatically cleaned up

## Installation

### From Chrome Web Store
*Coming soon...*

### Manual Installation (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/hughgramel/leetMode.git
   cd leetMode
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `leetMode` folder
   - The LeetMode icon should appear in your extensions toolbar

3. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find LeetMode and click the pin icon to keep it visible

## Usage

### Starting an Immediate Session

1. **Click the LeetMode icon** in your browser toolbar
2. **Click "Go into LeetMode"** to open the timer interface
3. **Set your session duration** using the hour and minute controls
4. **Click "Lock In"** to start your focused session
5. **Navigate freely** - any non-LeetCode sites will redirect to LeetCode

### Setting Up Scheduled Sessions

1. **Click the LeetMode icon** in your browser toolbar
2. **Click "Schedule Practice Times"** to open the scheduler
3. **Click the "+" button** to add a new schedule
4. **Configure your schedule**:
   - Enter a name for your schedule
   - Select the days you want to practice
   - Set start and end times for each day
   - Add multiple time ranges if needed
5. **Save your schedule** - it will appear in your schedules list
6. **Sessions will start automatically** based on your schedule

### Managing Schedules

- **View all schedules** in the main schedule interface
- **Delete schedules** by clicking the trash icon on any schedule card
- **Active sessions are automatically stopped** when you delete a currently active schedule

## How It Works

### Technical Architecture

- **Manifest V3**: Built with the latest Chrome extension standards
- **Service Worker**: Background script handles navigation blocking and scheduling
- **Persistent Storage**: Uses Chrome's storage API to maintain state across restarts
- **Web Navigation API**: Intercepts navigation events to redirect non-LeetCode sites

### Blocking Logic

The extension uses Chrome's `webNavigation.onBeforeNavigate` API to:
1. **Monitor all navigation events** in the browser
2. **Check if blocking is active** (immediate session or scheduled time)
3. **Verify the target URL** is not a LeetCode domain
4. **Redirect to LeetCode** if conditions are met
5. **Allow LeetCode navigation** to proceed normally

### State Management

- **Active Sessions**: Stored in `chrome.storage.local` for persistence
- **Schedules**: Stored in `chrome.storage.sync` for cross-device sync
- **Automatic Cleanup**: Expired sessions are removed from storage
- **Service Worker Recovery**: State is restored when the service worker restarts

## Permissions

LeetMode requires the following permissions:

- **`tabs`**: To redirect tabs to LeetCode
- **`storage`**: To save schedules and session state
- **`webNavigation`**: To intercept and redirect navigation
- **`webRequest`**: For advanced blocking capabilities
- **`declarativeNetRequest`**: For efficient request handling
- **`alarms`**: For scheduled session management
- **`notifications`**: To show session start/end alerts
- **`<all_urls>`**: To monitor navigation across all websites

## Development

### Project Structure

```
leetMode/
├── manifest.json          # Extension configuration
├── popup.html             # Main popup interface
├── leetmode.html          # Timer interface
├── schedule.html          # Schedule management interface
├── scripts/
│   ├── background.js      # Service worker (main logic)
│   ├── popup.js          # Popup functionality
│   ├── leetmode.js       # Timer functionality
│   └── schedule.js       # Schedule management
├── styles/
│   ├── popup.css         # Popup styling
│   ├── leetmode.css      # Timer styling
│   └── schedule.css      # Schedule styling
└── icons/                # Extension icons
```

### Building and Testing

1. **Make changes** to the source files
2. **Reload the extension** in `chrome://extensions/`
3. **Test functionality** by starting sessions and navigating to different sites
4. **Check console logs** for debugging information

### Key Files

- **`background.js`**: Contains the core blocking logic, scheduling system, and state management
- **`popup.js`**: Handles the main popup interface and status display
- **`schedule.js`**: Manages schedule creation, editing, and deletion
- **`leetmode.js`**: Controls the timer interface for immediate sessions

## Contributing

We welcome contributions! Here's how you can help:

### Bug Reports
- Use GitHub Issues to report bugs
- Include steps to reproduce the issue
- Provide your Chrome version and extension version

### Feature Requests
- Open an issue with the "enhancement" label
- Describe the feature and its use case
- Consider the impact on existing functionality

### Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Troubleshooting

### Common Issues

**Extension not blocking websites:**
- Ensure the extension is enabled in `chrome://extensions/`
- Check that you have an active session (immediate or scheduled)
- Verify the website you're trying to access is not a LeetCode domain
- Try reloading the extension

**Scheduled sessions not starting:**
- Check that your schedule is saved correctly
- Verify the current time matches your scheduled time
- Ensure the extension has the necessary permissions
- Check the browser console for error messages

**Session state not persisting:**
- This is usually resolved by the automatic state restoration
- If issues persist, try disabling and re-enabling the extension
- Check that Chrome storage is not full

### Debug Mode

Enable debug logging by:
1. Opening Chrome DevTools (`F12`)
2. Going to the Console tab
3. Looking for LeetMode log messages
4. Check the background script logs in the Extensions page

## Privacy

LeetMode is designed with privacy in mind:

- **No data collection**: We don't collect or transmit any personal data
- **Local storage only**: All data is stored locally in your browser
- **No external requests**: The extension doesn't make requests to external servers
- **Open source**: All code is available for review

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ for the LeetCode community
- Inspired by the need for focused coding practice
- Thanks to all contributors and users for feedback and suggestions

## Support

- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Check this README for usage instructions
- **Community**: Join discussions in GitHub Discussions

---

**Happy Coding! 🎉**

*Stay focused, stay consistent, and keep solving those problems!*
