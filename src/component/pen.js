// Copyright © 2022 DocuSign, Inc.
// License: MIT Open Source https://opensource.org/licenses/MIT

// Local storage account key
import $ from 'jquery'; // Import jQuery if not already included in your project

const DSexampleAccountId = "DSCodePenAccountId";

// Busy indicator
const workingUpdate = function workingUpdateF(working) {
    if (working) {
        $("#spinner").removeClass("hide");
    } else {
        $("#spinner").addClass("hide");
    }
};

// Add the text message to the log as a new paragraph
function msg(s) {
    $("#msg").append(`<p>${s}<\p>`);
    $("#msg > *").last()[0].scrollIntoView({
        behavior: "smooth"
    });
}

// Add an HTML message
function htmlMsg(s) {
    $("#msg").append(s);
    $("#msg > *").last()[0].scrollIntoView({
        behavior: "smooth"
    });
}

// Add the error text message to the log as a new paragraph
function errMsg(s) {
    $("#msg").append(`<p class="text-danger">${s}<\p>`);
    $("#msg > *").last()[0].scrollIntoView({
        behavior: "smooth"
    });
}

// UsingHttps
function usingHttps() {
    // Using https?
    if (window.location.protocol === "https:") {
        $("#login").removeClass("hide");
        return true;
    } else {
        $("#login").addClass("hide");
        const errHtml = `<p class="text-danger">Error: please reload this page using https</p>`;
        htmlMsg(errHtml);
        return false;
    }
}

function getStoredAccountId() {
    let accountId = null;
    try {
        accountId = localStorage.getItem(DSexampleAccountId)
    } catch {};
    return accountId
}

function setStoredAccountId(accountId) {
    try {
        localStorage.setItem(DSexampleAccountId, accountId)
    } catch {};
}

/**
 * adjustRows implements the adjustable rows support
 * Based on https://htmldom.dev/create-resizable-split-views/
 */
function adjustRows() {
    const resizer = document.getElementById("dragMe");
    const topSide = resizer.previousElementSibling;
    const bottomSide = resizer.nextElementSibling;
    const prevSibling = resizer.previousElementSibling;
    let prevSiblingHeight = 0;

    // The current position of mouse
    let x = 0;
    let y = 0;

    // Height of top side
    let topHeight = 0;

    // Handle the mousedown event
    // that's triggered when user drags the resizer
    const mouseDownHandler = function (e) {
        // Get the current mouse position
        x = e.clientX;
        y = e.clientY;
        const rect = prevSibling.getBoundingClientRect();
        prevSiblingHeight = rect.height;

        // Attach the listeners to `document`
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
    };

    const mouseMoveHandler = function (e) {
        document.body.style.cursor = "row-resize";
        topSide.style.userSelect = "none";
        topSide.style.pointerEvents = "none";

        bottomSide.style.userSelect = "none";
        bottomSide.style.pointerEvents = "none";

        // How far the mouse has been moved
        const dy = e.clientY - y;

        const h =
            ((prevSiblingHeight + dy) * 100) /
            resizer.parentNode.getBoundingClientRect().height;
        prevSibling.style.height = `${h}%`;
    };

    const mouseUpHandler = function () {
        resizer.style.removeProperty("cursor");
        document.body.style.removeProperty("cursor");

        topSide.style.removeProperty("user-select");
        topSide.style.removeProperty("pointer-events");

        bottomSide.style.removeProperty("user-select");
        bottomSide.style.removeProperty("pointer-events");

        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
    };

    // Attach the handler
    resizer.addEventListener("mousedown", mouseDownHandler);
}

/////////////////////
export { msg, htmlMsg, adjustRows, errMsg, workingUpdate, usingHttps,
    getStoredAccountId, setStoredAccountId };
