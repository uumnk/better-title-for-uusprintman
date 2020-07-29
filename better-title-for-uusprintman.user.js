// ==UserScript==
// @name         Better title for uuSprintman
// @namespace    https://github.com/uumnk/better-title-for-uusprintman
// @version      0.2
// @description  Adds page name to uuSprintman's document title to make it better and make saving to bookmarks easier.
// @author       Monika
// @match        https://uuapp.plus4u.net/uu-sprintman-maing01/*/ticket?id=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const CHANGE_TITLE_ORDER = true; // Better ordering of the title - put the ticket number and name to the start of the title.
    const PAGE_TITLE_REGEX = /(^.+?)-(T\d{3})-(.+)/;

    // Page content is loaded dynamically so we need to wait and try it in intervals (body.onload is triggered before the content is loaded so it won't help).
    const interval = 1000;
    // There is limited count of attempts because structure of the page could change so this script would be looking for it forever.
    let attempts = 10;
    // Query was made to ensure that the page title is found and nothing else. If the script stops working, maybe structure of the page has changed and it will be necessary to change this query.
    let titleQuery = "h1.uu5-bricks-header .uu5-bricks-text"

    let timer = setInterval(() => {
        let documentTitle = document.title;
        let titleElementList = document.querySelectorAll(titleQuery);
        if (documentTitle === "uuSprintman" && titleElementList.length === 1) { // Document title is unchanged and the page title element was found.
            let pageTitle = titleElementList[0].innerHTML;
            if (CHANGE_TITLE_ORDER && PAGE_TITLE_REGEX.test(pageTitle)) {
                pageTitle = pageTitle.replace(PAGE_TITLE_REGEX, '$2-$3 ($1)');
            }
            document.title = pageTitle + " - " + documentTitle;
            clearInterval(timer);
        } else if (attempts > 0) { // Page content is probably not loaded yet.
            attempts--;
        } else { // Page title was probably not found (or title was changed or the loading is incredibly slow).
            clearInterval(timer);
        }
    }, interval);
})();