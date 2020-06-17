# better-title-for-uusprintman
Adds page name to uuSprintman's document title to make it better and make saving to bookmarks easier.

## How to install Tampermonkey script
1. Install Tampermonkey from https://www.tampermonkey.net/ if you do not have it yet.
2. Install this user script from URL: [better-title-for-uusprintman.user.js](https://github.com/uumnk/better-title-for-uusprintman/raw/master/better-title-for-uusprintman.user.js)

**Quick guide:**
1. (Re)load some uuSprintman page with Ticket.
2. Title should be set automatically after full load of the page.
3. Optional: If you want the title in a different format, try to change value of boolean constant CHANGE_TITLE_ORDER in the script.

**Known issues: note that in the current version:**
1. The document title is altered only in tickets (tasks).
2. The document title is set only once after loading uuSprintman, if you go to another ticket, you have to refresh the page to change the document title.