/**
 * @file calendar.js
 * @description App entry: init, navigation, and wiring of data + UI modules.
 * @author G.E. Eidsness	
 * @version $Revision: 009 $
 * $Date: 2013-09-16 12:01:39 -0700 (Mon, 16 Sept 2013) $
 * @version $Revisions: 003 $
 * $Date: 2023-11-17 00:46:39 -0700 (Fri, 17 Nov 2023) $
 * $Date: 2024-09-29 10:06:39 -0700 (Mon, 29 Sept 2024) $
 * $Date: 2026-07-28 11:36:29 -0700 (Tue, 28 July 2026) $
*/

import "./date.js";
import { DateDisplay } from "./date-display.js";
import { loadShowings, monthJsonUrl } from "./data.js";
import {
  bindDetailsApi,
  clearDetailsPanels,
  clearDivBackgroundColor,
  createSearchAndResultsField,
  matchDate,
  removeElementIfExists,
  searchForTodaysListing,
  setDateClick,
} from "./ui-details.js";

/** @type {DateDisplay|null} */
let dateDisplay = null;

/**
 * Apply navigateTo from loadShowings (fallback month after 404).
 * @param {{ ok: boolean, navigateTo: Date|null }} result
 */
const applyLoadResult = (result) => {
  if (result.navigateTo) {
    setDate(
      result.navigateTo.getFullYear(),
      result.navigateTo.getMonth() + 1,
      1
    );
  }
};

/**
 * Set active date and refresh current view.
 * @param {string|number} year
 * @param {string|number} month
 * @param {string|number} day
 */
const setDate = (year, month, day) => {
  if (!dateDisplay) return;
  const newDate = new Date(year, month - 1, day);
  dateDisplay.setDate(newDate);
  const type = document.getElementById("dateDisplay").className;
  if (type === "month") {
    dateDisplay.displayMonth();
  } else if (type === "week") {
    dateDisplay.displayWeek();
  }
};

const goToDate = () => {
  if (!dateDisplay) return;
  clearDivBackgroundColor();
  clearDetailsPanels();
  document.getElementById("navButtons").className = "inactive";
  document.getElementById("navSearch").className = "active";
  document.getElementById("year").value = dateDisplay._date.getFullYear();
  document.getElementById("month").value = dateDisplay._date.getMonth() + 1;
  document.getElementById("day").value = dateDisplay._date.getDate();
};

const setDateSubmit = async () => {
  if (!dateDisplay) return;
  const year = document.getElementById("year").value;
  const month = document.getElementById("month").value;
  const day = document.getElementById("day").value;

  const result = await loadShowings(monthJsonUrl(year, month));
  if (result.navigateTo) {
    applyLoadResult(result);
  } else {
    setDate(year, month, day);
  }
  document.getElementById("navButtons").className = "active";
  document.getElementById("navSearch").className = "inactive";
  matchDate(dateDisplay._date.getDelimDate());
};

const switchView = async () => {
  if (!dateDisplay) return;
  removeElementIfExists("searchDiv");
  removeElementIfExists("resultsDiv");
  const type = document.getElementById("dateDisplay").className;
  if (type === "month") {
    dateDisplay.displayWeek();
  } else if (type === "week") {
    const result = await loadShowings(
      monthJsonUrl(
        dateDisplay._date.getFullYear(),
        dateDisplay._date.getMonth() + 1
      )
    );
    applyLoadResult(result);
    dateDisplay.displayMonth();
  }
};

const displayPrevious = async () => {
  if (!dateDisplay) return;
  clearDetailsPanels();
  const type = document.getElementById("dateDisplay").className;
  if (type === "month") {
    dateDisplay._date.decrementByMonth();
    const result = await loadShowings(
      monthJsonUrl(
        dateDisplay._date.getFullYear(),
        dateDisplay._date.getMonth() + 1
      )
    );
    applyLoadResult(result);
    dateDisplay.displayMonth();
  } else if (type === "week") {
    dateDisplay._date.decrementByWeek();
    const result = await loadShowings(
      monthJsonUrl(
        dateDisplay._date.getFullYear(),
        dateDisplay._date.getMonth() + 1
      )
    );
    applyLoadResult(result);
    dateDisplay.displayWeek();
  }
};

const displayNext = async () => {
  if (!dateDisplay) return;
  clearDetailsPanels();
  const type = document.getElementById("dateDisplay").className;
  if (type === "month") {
    dateDisplay._date.incrementByMonth();
    const result = await loadShowings(
      monthJsonUrl(
        dateDisplay._date.getFullYear(),
        dateDisplay._date.getMonth() + 1
      )
    );
    applyLoadResult(result);
    dateDisplay.displayMonth();
  } else if (type === "week") {
    dateDisplay._date.incrementByWeek();
    const result = await loadShowings(
      monthJsonUrl(
        dateDisplay._date.getFullYear(),
        dateDisplay._date.getMonth() + 1
      )
    );
    applyLoadResult(result);
    dateDisplay.displayWeek();
  }
};

const bindNav = () => {
  document.getElementById("previous").addEventListener("click", async () => {
    await displayPrevious();
    searchForTodaysListing();
  });
  document.getElementById("weekMonth").addEventListener("click", async () => {
    await switchView();
    searchForTodaysListing();
  });
  document.getElementById("next").addEventListener("click", async () => {
    await displayNext();
    searchForTodaysListing();
  });
  document.getElementById("goToDate").addEventListener("click", goToDate);
  document.getElementById("setDateSubmit").addEventListener("click", () => {
    setDateSubmit().catch((err) => console.error(err));
  });
  document
    .getElementById("search")
    .addEventListener("click", createSearchAndResultsField);
  document
    .getElementById("dateDisplay")
    .addEventListener("click", setDateClick);
};

const init = async () => {
  const displayDateNode = document.getElementById("dateDisplay");
  const displayTitleNode = document.getElementById("displayTitle");
  const displayDetailsNode = document.getElementById("details");

  if (!displayDateNode || !displayTitleNode || !displayDetailsNode) {
    console.error("Required DOM nodes missing.");
    return;
  }

  const todaysDate = new Date();
  const result = await loadShowings(
    monthJsonUrl(todaysDate.getFullYear(), todaysDate.getMonth() + 1)
  );

  dateDisplay = new DateDisplay(
    displayDateNode,
    displayTitleNode,
    displayDetailsNode,
    todaysDate
  );
  bindDetailsApi(dateDisplay, setDate);

  if (result.navigateTo) {
    applyLoadResult(result);
  }

  bindNav();
  dateDisplay.displayMonth();
  searchForTodaysListing();
};

document.addEventListener("DOMContentLoaded", () => {
  init().catch((err) => {
    console.error(err);
    alert("Failed to initialize calendar.");
  });
});
