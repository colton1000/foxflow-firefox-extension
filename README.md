
FoxFlow
FoxFlow is an experimental Firefox desktop extension that combines lightweight ad and tracker blocking, website quality-of-life controls, tiled tab layouts, a calculator, a website scheduler, a customizable soundboard, sound-effect search, and a highlighted-math helper in one interface.
The extension opens in a persistent utility window instead of a normal Firefox toolbar popup. This is important because normal toolbar popups close when they lose focus. The persistent window remains open while you use a file picker or drag audio and image files into the soundboard. Click the FoxFlow toolbar icon once to open the window and click it again to close it.
> FoxFlow is a personal development project and lightweight blocker. It is not a replacement for a mature, continuously maintained content blocker. YouTube and advertising systems change frequently, so blocking behavior may require future updates.
Features
Ad and tracker blocking
FoxFlow uses Firefox's `webRequest` API to inspect network requests. When blocking is enabled, `background.js` cancels requests that match its built-in list of common advertising and tracking hosts or known advertising URL fragments.
The content script also hides common advertisement containers and placeholders using CSS selectors. Network filtering and cosmetic filtering can be enabled or disabled independently from the Tools menu.
YouTube cleanup
On YouTube pages, the content script watches for common ad-player states, attempts to click available skip buttons, removes known overlay elements, and advances certain detected advertisements toward their end. This is best-effort behavior and may stop working whenever YouTube changes its player or ad delivery.
Website quality-of-life tools
The Tools menu includes:
Darken pages: Applies a reversible color filter to the current website.
Focus mode: Hides common headers, navigation elements, sidebars, and footers.
Hide sticky elements: Hides fixed or sticky overlays that can cover page content.
Pause autoplay: Pauses autoplaying audio and video outside YouTube.
Back to top: Adds a floating button to quickly return to the top of a page.
Copy clean URL: Copies the current address after removing common tracking parameters such as `utm_*`, `fbclid`, and `gclid`.
Solve highlighted math: Displays the result of selected basic arithmetic near the highlighted text.
Some quality-of-life options are broad by design and may hide useful controls on certain websites. Turn off the affected option and refresh the page if a site does not display correctly.
Highlighted-math helper
When Solve highlighted math is enabled, highlight a basic arithmetic expression on a webpage, such as:
```text
(8 + 2) * 5
```
FoxFlow displays the result below the selection. The parser supports:
Addition and subtraction
Multiplication using `*`, `x`, or `×`
Division using `/` or `÷`
Parentheses
Decimal values
Positive and negative numbers
The helper only accepts arithmetic characters. It does not execute selected webpage code, functions, variable names, or arbitrary JavaScript.
Three-tab and four-tab layouts
The Split View controls place the active tab and nearby unpinned tabs into separate Firefox windows arranged across the available screen area.
3 tabs: One large window on the left with two stacked windows on the right.
4 tabs: A two-by-two window grid.
Gather tiled tabs: Moves unpinned tabs from the other Firefox windows back into the current window and maximizes it.
FoxFlow uses real browser windows because many websites block iframe embedding. If there are too few tabs, blank tabs are created to complete the selected layout.
Calculator
The Calculator menu includes clickable number and operator buttons. It supports decimals, parentheses, positive and negative values, addition, subtraction, multiplication, and division.
Keyboard controls are also supported while the Calculator menu is active:
Number and operator keys enter an expression.
Enter calculates the result.
Backspace removes the last character.
Escape clears the calculator.
The calculator uses a dedicated arithmetic parser rather than `eval()` or `Function()`, which keeps it compatible with Firefox extension content-security rules.
Website scheduler
The Scheduler menu opens a website at a selected local date and time:
Enter a website address.
Select a future date and time.
Click Schedule website.
FoxFlow adds `https://` when the address does not include a protocol. The schedule is saved in `browser.storage.local`, and a Firefox alarm is created for the selected time. When the alarm fires, `background.js` opens the website in a new active tab and removes the completed schedule.
Upcoming entries appear in the Scheduler menu and can be canceled individually. Future alarms are reconstructed from saved schedule data when the browser starts. Firefox must be running for the website to open at the exact scheduled moment. If Firefox is not running, behavior after the scheduled time depends on Firefox's alarm handling and the extension's startup cleanup.
Soundboard
The Soundboard stores custom sound buttons locally. Each entry contains:
A name
An imported audio file
An optional PNG or JPG image
To add a sound:
Open Soundboard.
Drag an audio file into the drop zone. You can drop an optional PNG or JPG at the same time.
Alternatively, click the drop zone or use the separate Audio and Image file inputs.
Review or edit the automatically generated name.
Click Add sound.
Click a saved sound card to play it. Use the volume slider to control playback volume. Click Delete to remove an entry.
Audio and images are converted to data URLs and stored in Firefox extension storage. They are not uploaded by FoxFlow. Large audio collections can consume significant disk space even though the extension requests `unlimitedStorage`.
The Soundboard also includes a Pixabay search box and an Air Horn shortcut. Search opens a normal Firefox tab. Download a sound manually, review the license shown by the provider, and then import the downloaded file into FoxFlow. The extension does not scrape, proxy, or automatically download sound files.
Requirements
Firefox desktop version 109 or later
Windows, macOS, or Linux
Permission to load a temporary extension for development
A square JPG named `icon.jpg`
The project currently uses Manifest Version 2 because its lightweight network blocker relies on Firefox's blocking `webRequest` behavior.
Project layout
```text
foxflow-extension/
├── .gitignore
├── README.md
├── manifest.json
├── background.js
├── content.js
├── content.css
├── popup.html
├── popup.css
├── popup.js
├── options.html
└── icon.jpg              # Add your own file
```
File responsibilities
`manifest.json`: Declares the extension, permissions, scripts, minimum Firefox version, toolbar action, and icon paths.
`background.js`: Handles request blocking, tiled windows, saved settings, website alarms, sound playback, and persistent-window toggling.
`content.js`: Runs on websites to apply cosmetic filtering, quality-of-life behavior, YouTube cleanup, the back-to-top button, and highlighted-math detection.
`content.css`: Styles injected page elements and applies page-level visual modes.
`popup.html`: Defines the persistent FoxFlow interface and its menus.
`popup.css`: Styles the Tools, Calculator, Scheduler, and Soundboard interfaces.
`popup.js`: Handles user controls, calculator input, schedules, sound imports, drag and drop, sound cards, and sound searches.
`options.html`: Provides a small built-in notes page.
`icon.jpg`: User-supplied toolbar and extension icon.
`.gitignore`: Prevents generated packages, editor files, logs, caches, and local artifacts from entering the repository.
Set up the extension
1. Extract the project
Extract the downloaded ZIP into a normal folder. Do not try to select the ZIP itself in `about:debugging`.
Example location on Windows:
```text
C:\Users\YourName\Documents\foxflow-extension
```
2. Add the icon
Add a square JPG to the project root and name it exactly:
```text
icon.jpg
```
The filename is case-sensitive on some operating systems. A 96 by 96 pixel or larger square image is recommended. The extension references the same JPG for its toolbar and extension icons.
3. Load it temporarily in Firefox
Open Firefox.
Enter `about:debugging` in the address bar.
Select This Firefox.
Click Load Temporary Add-on.
Open the extracted FoxFlow folder.
Select `manifest.json`.
Pin FoxFlow to the toolbar if it is hidden in the Extensions menu.
Temporary extensions are removed when Firefox exits. Repeat these steps after restarting Firefox.
4. Open FoxFlow
Click the FoxFlow toolbar icon. Firefox opens a separate FoxFlow utility window. The window remains open while you browse for files or drag files into it. Click the toolbar icon again to close the utility window.
If the icon seems to do nothing, check for the FoxFlow window behind the main Firefox window or in the taskbar.
Updating during development
After editing project files:
Open `about:debugging`.
Find FoxFlow under Temporary Extensions.
Click Reload.
Refresh any existing website tabs if you changed `content.js` or `content.css`.
Background, interface, and manifest changes generally take effect after reloading the extension. Content-script changes require affected pages to be refreshed because an already loaded page continues running the previous injected script.
Creating a Git repository
From a terminal inside the extracted project folder:
```bash
git init
git add .
git commit -m "Initial FoxFlow extension"
```
The included `.gitignore` excludes packaged ZIP/XPI files, build folders, caches, logs, temporary files, dependency folders, and common editor settings. By default, `icon.jpg` is allowed into Git. Uncomment the `icon.jpg` line in `.gitignore` if your icon should remain local.
Packaging
For a simple development ZIP, run the following command from inside the project folder.
PowerShell
```powershell
Compress-Archive -Path * -DestinationPath foxflow-extension.zip -Force
```
Linux or macOS
```bash
zip -r foxflow-extension.zip . -x "*.git*" "*.zip"
```
The ZIP is useful for sharing source files, but Firefox release installation normally requires extension signing. Do not include secrets, private audio, copyrighted files you cannot redistribute, or personal configuration in a public package.
Permissions
FoxFlow requests broad permissions because many features operate across sites:
`<all_urls>`: Allows content scripts and request filtering on websites.
`webRequest` and `webRequestBlocking`: Observe and cancel matching network requests.
`tabs`: Read and organize tabs, open scheduled websites, clean the active URL, and create tiled layouts.
`storage`: Save settings, schedules, and soundboard entries.
`unlimitedStorage`: Allows larger locally stored audio and image collections, subject to available space and Firefox limits.
`alarms`: Schedule websites to open later.
`clipboardWrite`: Copy a cleaned URL to the clipboard.
Review `manifest.json` before installing. Remove features and permissions you do not want rather than granting access you do not intend to use.
Privacy
FoxFlow does not contain analytics or an account system. Settings, schedules, imported sounds, and imported images are stored locally by Firefox. The extension only opens an external website when you use the sound search or when one of your own schedules fires.
Because FoxFlow can inspect requests and inject scripts on all websites, only install source you trust. Review the source before sharing or signing the extension.
Troubleshooting
Firefox reports that `icon.jpg` is missing
Place `icon.jpg` beside `manifest.json`, verify the spelling, and reload the extension.
The FoxFlow window does not open
Look behind the main Firefox window or in the taskbar.
Remove the temporary extension and load `manifest.json` again.
Open the Browser Console from `about:debugging` and inspect the extension for errors.
Drag and drop does not work
Use version 1.3.0 or later, which opens a persistent utility window.
Drop files onto the dashed Soundboard drop zone.
Confirm the audio file uses a format supported by Firefox.
Use PNG or JPG for button images.
Try the file inputs if the operating system blocks drag and drop.
A sound will not play
The file may use an unsupported codec even if its extension looks familiar. Try MP3, OGG, or WAV. Re-import the sound after converting it to a browser-compatible format.
The calculator displays an error
Check for mismatched parentheses, repeated decimal points, missing operators, or division by zero. Only standard arithmetic is supported.
Highlighted math does not appear
Enable Solve highlighted math in Tools.
Refresh the website after installing or reloading FoxFlow.
Highlight only the arithmetic expression.
Firefox internal pages such as `about:` pages cannot be modified by normal content scripts.
A website looks broken
Disable Darken pages, Focus mode, Hide sticky elements, or cosmetic filtering, then refresh the page. Broad layout selectors can affect unusual website designs.
Ads still appear
The built-in lists are intentionally small, advertisements may be served from first-party domains, and YouTube changes frequently. Update `blockedHosts`, `urlFragments`, and cosmetic selectors in the source if you are developing the blocker further.
A scheduled website does not open
Confirm the date and time are in the future.
Keep Firefox running at the scheduled time.
Verify that the schedule still appears in the Scheduler menu.
Check that the address uses HTTP or HTTPS.
Split view uses the wrong tabs
FoxFlow starts with the active tab and then uses nearby unpinned tabs from the same window. Move or close tabs before activating Split View if you need a particular group.
Development notes
Keep remote JavaScript out of the extension. External pages may be opened in normal tabs, but extension logic should remain packaged locally.
Escape or assign user-provided values with DOM text properties instead of inserting them as HTML.
Test changes with Firefox's extension debugging tools.
Increase the version number in `manifest.json` for each published build.
Test request blocking, content scripts, scheduling, sound storage, and window management separately after major changes.
Large base64-encoded audio files increase storage use by more than the original binary file size. A future production version should consider IndexedDB or another structured binary-storage approach.
Current version
1.3.1
This release adds repository housekeeping and complete setup, architecture, usage, privacy, permissions, packaging, development, and troubleshooting documentation. Functional extension behavior is unchanged from version 1.3.0.
License
No license is included by default. Add a `LICENSE` Imported sounds and images remain subject to their own licenses.
