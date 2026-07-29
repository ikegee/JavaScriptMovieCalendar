/**
 * @file ui-details.js
 * @description Details pane, listing selection, and search UI.
 * @author G.E. Eidsness	
 * @version $Revision: 009 $
 * $Date: 2013-09-16 12:01:39 -0700 (Mon, 16 Sept 2013) $
 * @version $Revisions: 002 $
 * $Date: 2023-11-17 00:46:39 -0700 (Fri, 17 Nov 2023) $
 * $Date: 2024-09-29 10:06:39 -0700 (Mon, 29 Sept 2024) $
 * @version $Rewrite: 001 $
 * $Date: 2026-07-28 11:36:29 -0700 (Tue, 28 July 2026) $
*/

import { jsonShowings, monthJsonUrl, fetchAsyncListing, pad2 } from "./data.js";

/** @type {import('./date-display.js').DateDisplay|null} */
let dateDisplay = null;

/** @type {(year: string|number, month: string|number, day: string|number) => void} */
let onSetDate = () => {};

/** Last clicked element inside the calendar (listing or day cell). */
let clickTarget = null;

/**
 * Wire the active DateDisplay and a setDate callback from calendar.js.
 * @param {import('./date-display.js').DateDisplay} display
 * @param {(year: string|number, month: string|number, day: string|number) => void} setDateFn
 */
export const bindDetailsApi = (display, setDateFn) => {
  dateDisplay = display;
  onSetDate = setDateFn;
};

/**
 * Remove a details-pane child by id when it is the last child.
 * @param {string} id
 */
export const removeElementIfExists = (id) => {
  const element = document.getElementById(id);
  if (element && dateDisplay && element === dateDisplay._detailsNode.lastChild) {
    element.remove();
  }
};

export const clearDetailsPanels = () => {
  removeElementIfExists("ajaxDetails");
  removeElementIfExists("searchDiv");
  removeElementIfExists("resultsDiv");
};

/**
 * Build and append movie details for a day's showings.
 * @param {Object.<string, import('./data.js').Showing>} showingsDate
 * @param {string} [listingId] ISO id of a specific listing element
 */
export const constructDetails = (showingsDate, listingId) => {
  if (!dateDisplay || !showingsDate) return;

  const todayKey = new Date().getDelimDate();
  const todayMs = Date.parse(todayKey.replace(/_/g, "-"));

  try {
    clearDetailsPanels();

    for (const key of Object.keys(showingsDate)) {
      if (listingId) {
        clickTarget = document.getElementById(listingId);
      }
      if (!clickTarget) continue;

      const tag = new Date(clickTarget.id).toISOString();
      if (showingsDate[key].date.toISOString() !== tag) continue;

      const showingDayMs = Date.parse(tag.split("T")[0]);
      const minutes = pad2(showingsDate[key].date.getMinutes());

      let detailsHTML = `
            ${showingsDate[key].date.getUTCHours()}:${minutes} ${showingsDate[key].date.getMonthWord()}
            ${showingsDate[key].date.getUTCDate()}<br><br>
            ${showingsDate[key].title}<br><br>
            ${showingsDate[key].dur} mins<br><br>
            ${showingsDate[key].descr}
          `;

      if (todayMs === showingDayMs) {
        detailsHTML += "<br><br><br><span>***  Showing Today!  ***</span>";
      }

      const detailsDiv = document.createElement("div");
      detailsDiv.id = "ajaxDetails";
      detailsDiv.innerHTML = detailsHTML;
      dateDisplay._detailsNode.appendChild(detailsDiv);
    }
  } catch (error) {
    alert("Parsing Failed: " + error.name + ": " + error.message);
  }
};

/**
 * If a .today cell exists, show its first listing in the details pane.
 */
export const searchForTodaysListing = () => {
  if (!dateDisplay) return;

  try {
    removeElementIfExists("searchDiv");
    removeElementIfExists("ajaxDetails");

    const todaysDateDiv = document.querySelector(".today");
    if (!todaysDateDiv || !todaysDateDiv.id) {
      return;
    }

    const listings = document.querySelectorAll(".listing");
    let found = false;

    for (const div of listings) {
      if (div.id.split("T")[0].replace(/-/g, "_") === todaysDateDiv.id) {
        constructDetails(jsonShowings[todaysDateDiv.id], div.id);
        found = true;
        break;
      }
    }

    if (!found) {
      const displayedMonth = (dateDisplay._date.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      if (todaysDateDiv.id.split("_")[1] === displayedMonth) {
        const detailsDiv = document.createElement("div");
        detailsDiv.id = "ajaxDetails";
        detailsDiv.innerHTML = `No Listing Today: ${dateDisplay._date.getDelimDate()}`;
        dateDisplay._detailsNode.appendChild(detailsDiv);
      }
    }
  } catch (error) {
    console.error("searchForTodaysListing() error:", error);
  }
};

/**
 * Calendar click: select day and/or show listing details.
 * @param {MouseEvent} event
 */
export const setDateClick = (event) => {
  removeElementIfExists("resultsDiv");
  try {
    const listing = event.target.closest(".listing");
    const dayCell = event.target.closest(".dateBlock, .today");

    if (listing && dayCell) {
      clickTarget = listing;
      const targetDate = dayCell.id;
      const parts = targetDate.split("_");
      constructDetails(jsonShowings[targetDate]);
      onSetDate(parts[0], parts[1], parts[2]);
      return;
    }

    if (dayCell) {
      clickTarget = dayCell;
      const parts = dayCell.id.split("_");
      onSetDate(parts[0], parts[1], parts[2]);
    }
  } catch (error) {
    console.error("setDateClick error:", error);
  }
};

export const clearDivBackgroundColor = () => {
  document.querySelectorAll(".listing").forEach((el) => {
    if (el.style.backgroundColor) {
      el.style.backgroundColor = "";
    }
  });
};

const changeDivBackgroundColor = (id, className) => {
  const div = document.getElementById(id);
  if (div && div.classList.contains(className)) {
    div.style.backgroundColor = "orange";
  }
};

const searchSubmit = () => {
  if (!dateDisplay) return;

  clearDivBackgroundColor();
  const jsonURL = monthJsonUrl(
    dateDisplay._date.getFullYear(),
    dateDisplay._date.getMonth() + 1
  );
  const searchTermEl = document.getElementById("searchTerm");
  const searchTypeEl = document.getElementById("searchType");
  const resultsDiv = document.getElementById("resultsDiv");
  if (!searchTermEl || !resultsDiv) return;

  const searchTerm = searchTermEl.value;
  const searchType = searchTypeEl ? searchTypeEl.value : "title";
  resultsDiv.innerHTML = "";

  fetchAsyncListing(jsonURL, searchTerm, searchType).then((matchedListings) => {
    if (matchedListings.length === 0) {
      resultsDiv.appendChild(document.createElement("br"));
      resultsDiv.appendChild(
        document.createTextNode("No Search listings found")
      );
      return;
    }

    matchedListings.forEach((listing) => {
      changeDivBackgroundColor(listing.date, "listing");
      resultsDiv.appendChild(document.createElement("br"));
      resultsDiv.appendChild(
        document.createTextNode(listing.title + " | " + listing.date)
      );
    });
  });
};

/**
 * Create (or reset) the search panel and results area in the details pane.
 */
export const createSearchAndResultsField = () => {
  if (!dateDisplay) return;

  removeElementIfExists("ajaxDetails");
  removeElementIfExists("resultsDiv");

  let searchDiv = document.getElementById("searchDiv");
  if (!searchDiv) {
    searchDiv = document.createElement("div");
    searchDiv.id = "searchDiv";
    searchDiv.innerHTML = `
        <input type="text" id="searchTerm" title="searchTerm" placeholder="Search Term">
        <select id="searchType" title="searchType" name="searchType">
          <option value="title">Title</option>
          <option value="descr">Description</option>
        </select>
        <input type="button" id="searchBtn" value="Search">
      `;
    searchDiv
      .querySelector("#searchBtn")
      .addEventListener("click", searchSubmit);
    dateDisplay._detailsNode.appendChild(searchDiv);
  } else {
    clearDivBackgroundColor();
    const searchTerm = document.getElementById("searchTerm");
    if (searchTerm) searchTerm.value = "";
  }

  const resultsDiv = document.createElement("div");
  resultsDiv.id = "resultsDiv";
  dateDisplay._detailsNode.appendChild(resultsDiv);
};

/**
 * Highlight a day cell and show its first listing (or a no-listing message).
 * @param {string} dateString YYYY_MM_DD
 */
export const matchDate = (dateString) => {
  if (!dateDisplay) return;

  try {
    clearDetailsPanels();

    const targetDiv = document.getElementById(dateString);
    if (!targetDiv) return;

    targetDiv.style.borderColor = "red";
    const clearBorder = () => {
      targetDiv.style.borderColor = "";
      targetDiv.removeEventListener("mouseleave", clearBorder);
    };
    targetDiv.addEventListener("mouseleave", clearBorder);

    const listings = document.querySelectorAll(".listing");
    let found = false;

    for (const div of listings) {
      if (div.id.split("T")[0].replace(/-/g, "_") === targetDiv.id) {
        constructDetails(jsonShowings[targetDiv.id], div.id);
        found = true;
        break;
      }
    }

    if (!found) {
      const detailsDiv = document.createElement("div");
      detailsDiv.id = "ajaxDetails";
      detailsDiv.innerHTML = `No Listing for today: ${targetDiv.id}`;
      dateDisplay._detailsNode.appendChild(detailsDiv);
    }
  } catch (error) {
    console.error("matchDate() error:", error);
  }
};
