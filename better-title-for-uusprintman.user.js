// ==UserScript==
// @name         Better title for uuSprintMan
// @namespace    https://github.com/uumnk/better-title-for-uusprintman
// @version      0.3
// @description  Adds page name to uuSprintMan's document title to make it better and make saving to bookmarks easier.
// @author       Monika
// @match        https://uuapp.plus4u.net/uu-sprintman-maing01/*/ticket?id=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ===== Settings - change it, if you wish =====
    // Better ordering of the title - put the ticket number and name to the start of the title.
    const CHANGE_TITLE_ORDER = true;
    // Pattern how the changed title order should look like - you can use these symbols: $1 = project name, $2 = task code, $3 = task name. Not used if CHANGE_TITLE_ORDER = false.
    const REPLACE_PATTERN = '$2-$3 ($1)';
    // Title suffix - what should the script leave in the title? ORIGINAL = whole original title as is, SPRINTMAN = only the last "uuSprintMan" part, NO - nothing (even the separator).
    const TITLE_SUFFIX = "SPRINTMAN";
    // Separator between the added and the original part of the title. Not used if TITLE_SUFFIX = "NO".
    const TITLE_SEPARATOR = " - ";

    // ===== System configuration - change only in case of trouble (you can also report the issue into GitHub repository) =====
    // Debug verbosity - makes the script very verbose to be able to better debug it.
    const DEBUG = false;
    // Regular expression for determination of the page title and its groups. Page title syntax is: <projectName>-<T123(task code starting with letter T)>-<Task title>
    const PAGE_TITLE_REGEX = /(^.+?)-(T\d{3})-(.+)/;
    // Page content is loaded dynamically so we need to wait and try it in intervals (body.onload is triggered before the content is loaded so it won't help).
    const CHECK_INTERVAL = 1000;
    // Query was made to ensure that the page title is found and nothing else. If the script stops working, maybe structure of the page has changed and it will be necessary to change this query.
    const TITLE_QUERY = "h1.uu5-bricks-header .uu5-bricks-text"
    // Legacy SprintMan title.
    const UU_SPRINT_MAN_TITLE_LEGACY = "uuSprintman";
    // New end of SprintMan title.
    const UU_SPRINT_MAN_TITLE = "uuSprintMan";
    // Regex for both SprintMan titles.
    const SPRINT_MAN_REGEX = "(?:" + UU_SPRINT_MAN_TITLE + "|" + UU_SPRINT_MAN_TITLE_LEGACY + ")$";
    // Prefix of all messages written to the console to be able to easily recognize them.
    const CONSOLE_PREFIX = "[Better title for uuSprintMan] ";

    // There is limited count of attempts because structure of the page could change so this script would be looking for it forever.
    let checkAttempts = 10;

    // ===== Functions =====
    function resolveTitle(titleElementList, documentTitle, out) {
        if (DEBUG) console.debug(CONSOLE_PREFIX + "Resolving title.");
        if (titleElementList.length !== 1) {
            out.errorMessage = "The page title element was not found - maybe the document structure has changed or the script was run on a wrong page.";
            if (DEBUG) console.debug(CONSOLE_PREFIX + out.errorMessage);
            return false;
        }

        let pageTitle = titleElementList[0].innerHTML;
        if (pageTitle == null || typeof pageTitle !== "string") {
            out.errorMessage = "There is a wrong content in the page title element - maybe the document structure has changed or the script was run on a wrong page.";
            if (DEBUG) console.debug(CONSOLE_PREFIX + out.errorMessage);
            return false;
        }

        if (CHANGE_TITLE_ORDER && PAGE_TITLE_REGEX.test(pageTitle)) {
            // In case that better title ordering is requested, test if page title matches the regex and if so, perform the replace (order change).
            if (DEBUG) console.debug(CONSOLE_PREFIX + "Changing page title order.");
            pageTitle = pageTitle.replace(PAGE_TITLE_REGEX, REPLACE_PATTERN);
        }

        if (documentTitle == null || typeof documentTitle !== "string") {
            out.errorMessage = "The current document title is not valid string.";
            if (DEBUG) console.debug(CONSOLE_PREFIX + out.errorMessage);
            return false; // The current document title is not valid, it makes no sense to further test it.
        }

        if (documentTitle === UU_SPRINT_MAN_TITLE_LEGACY) {
            // In case that legacy original SprintMan title is recognized, perform the change.
            if (DEBUG) console.debug(CONSOLE_PREFIX + "Legacy title recognized.");
            return [pageTitle];
        }

        if (documentTitle.endsWith(UU_SPRINT_MAN_TITLE) && documentTitle === titleElementList[0].innerHTML.match(PAGE_TITLE_REGEX)[1] + " - " + UU_SPRINT_MAN_TITLE) {
            // In case that new original SprintMan title is recognized, perform the change.
            if (DEBUG) console.debug(CONSOLE_PREFIX + "New title recognized.");
            return [pageTitle];
        }

        // In case that no original title is recognized, do not perform the change.
        out.errorMessage = "The title does not correspond to any known SprintMan original titles - maybe its structure has changed or the script was run on a wrong page.";
        if (DEBUG) console.debug(CONSOLE_PREFIX + out.errorMessage);
        return false;
    }

    // ===== Main program =====
    let timer = setInterval(() => {
        try {
            if (DEBUG) console.debug(CONSOLE_PREFIX + "Starting an attempt.");
            let documentTitle = document.title;
            let titleElementList = document.querySelectorAll(TITLE_QUERY);
            let pageTitle;
            let out = {}; // Out object for error messages.
            if ((pageTitle = resolveTitle(titleElementList, documentTitle, out))) { // Document title is unchanged and the page title element was found.
                if (DEBUG) console.debug(CONSOLE_PREFIX + "Setting the document.title.");
                document.title = pageTitle + (TITLE_SUFFIX !== "NO" && (TITLE_SEPARATOR + (TITLE_SUFFIX === "SPRINTMAN" ? documentTitle.match(SPRINT_MAN_REGEX)[0] : documentTitle)));
                clearInterval(timer);
                if (DEBUG) console.debug(CONSOLE_PREFIX + "Finished successfully.");
            } else if (checkAttempts > 0) { // Page content is probably not loaded yet.
                checkAttempts--;
                if (DEBUG) console.debug(CONSOLE_PREFIX + "One attempt is gone, will try again in a second.");
            } else { // Page title was probably not found (or title was changed or the loading is incredibly slow).
                if (out.errorMessage) {
                    console.warn(CONSOLE_PREFIX + out.errorMessage);
                }
                clearInterval(timer);
                if (DEBUG) console.debug(CONSOLE_PREFIX + "Finished unsuccessfully - all attempts are gone.");
            }
        } catch (e) {
            if (e.message) {
                console.warn(CONSOLE_PREFIX + e.message);
            }
            if (checkAttempts > 0) {
                checkAttempts--;
                if (DEBUG) console.debug(CONSOLE_PREFIX + "One attempt is gone (caught an error), will try again in a second.");
            } else {
                clearInterval(timer);
                if (DEBUG) console.debug(CONSOLE_PREFIX + "Finished unsuccessfully (caught an error) - all attempts are gone.");
            }
        }
    }, CHECK_INTERVAL);
    if (DEBUG) console.debug(CONSOLE_PREFIX + "Loaded.");
})();