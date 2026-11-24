MMCC Sovereign Portal — v26 Sidebar Layout Upgrade Package
===========================================================

Included Files:
1. sidebar-layout-patch.html
   - Paste the contents of this file directly before the closing </body> tag of your existing v25 index.html.
   - Note: Your original v25 index.html source code was not included in the chat attachment (only its file metadata and rendered text were visible), so this patch wraps and upgrades your existing v25 DOM safely without overwriting any of your custom modals, audio vault, or department scripts.

2. sw.js
   - Updated Service Worker bumped to cache version 'mmcc-13-depts-valet-hangar-v26-network-first' so devices immediately load the new sidebar layout.

3. manifest.json
   - Preserved PWA manifest configuration (#1a0207 background, #2b040c theme color).
