/**
 * @file date-display.js
 * @description Weekly and monthly calendar grid for movie showings.
 * @author Thomas Lane
 * @requires date.js
 * @version $Revision: 229 $
 * $Date: 2011-01-16 19:08:49 -0800 (Sun, 16 Jan 2011) $
 * @modified G.E. Eidsness
 * @version $Revisions: 003 $
 * $Date: 2023-11-17 00:46:39 -0700 (Fri, 17 Nov 2023) $
 * $Date: 2024-09-24 10:06:39 -0700 (Tue, 24 Sept 2024) $
 * $Date: 2026-07-28 11:36:29 -0700 (Tue, 28 July 2026) $
 */ 

import "./date.js";
import { jsonShowings } from "./data.js";

/**
 * Renders a week or month grid of days and listings into the page.
 */
export class DateDisplay {
  /**
   * @param {HTMLElement} dateNode - Calendar grid container
   * @param {HTMLElement} titleNode - Month/year title container
   * @param {HTMLElement} detailsNode - Details pane container
   * @param {Date} activeDay - Active date
   */
  constructor(dateNode, titleNode, detailsNode, activeDay) {
    this._displayNode = dateNode;
    this._titleNode = titleNode;
    this._detailsNode = detailsNode;
    this.setDate(activeDay);
  }

  /**
   * Removes all children from the display node.
   * @private
   */
  _clearDisplayDate() {
    this._displayNode.replaceChildren();
  }

  /**
   * Appends day-of-week heading labels.
   * @param {string} type "month" | "week"
   * @private
   */
  _appendHeading(type) {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const heading = document.createElement("div");
    heading.id = "headingContainer";
    heading.className = type;

    const fragment = document.createDocumentFragment();

    for (const dayName of dayNames) {
      const div = document.createElement("div");
      div.className = "dayName";
      div.textContent = dayName;
      fragment.appendChild(div);
    }

    heading.appendChild(fragment);
    this._displayNode.appendChild(heading);
  }

  /**
   * Appends one week of day cells (and listings) to the display.
   * @param {Date} day
   * @param {string} type "month" | "week"
   * @private
   */
  _appendWeek(day, type) {
    const weekContainer = document.createElement("div");
    const currentDate = new Date().getDelimDate();

    weekContainer.id = "weekContainer";
    weekContainer.className = type;

    const fragment = document.createDocumentFragment();

    for (
      let weekIterator = day.getWeekStart();
      weekIterator <= day.getWeekEnd();
      weekIterator.incrementByDay()
    ) {
      const dayText = weekIterator.getDate();
      const weekIteratorDate = weekIterator.getDelimDate();
      const weekIteratorMonth = weekIterator.getMonth();
      const weekIteratorYear = weekIterator.getFullYear();

      const dateNumDiv = document.createElement("div");
      dateNumDiv.className = "dateNum";
      dateNumDiv.textContent = String(dayText).padStart(2, "0") + " ";

      const divSpacer = document.createElement("div");
      divSpacer.className = "divSpacer";

      const div = document.createElement("div");
      div.appendChild(divSpacer);
      div.appendChild(dateNumDiv);

      const showings = jsonShowings[weekIteratorDate];
      if (showings) {
        const sortedShowings = Object.values(showings).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        for (const show of sortedShowings) {
          const showingsShowDate = new Date(show.date);
          const hours = String(showingsShowDate.getUTCHours()).padStart(2, "0");
          const minutes = String(showingsShowDate.getMinutes()).padStart(
            2,
            "0"
          );
          const movieData = `${hours}:${minutes} - ${show.title}`;

          const listingEl = document.createElement("div");
          listingEl.id = showingsShowDate.toISOString();
          listingEl.className = "listing";
          listingEl.textContent = movieData;
          div.appendChild(listingEl);

          if (type === "week") {
            const desc = document.createElement("div");
            desc.className = "description";
            desc.textContent = `${show.descr.substring(0, 120)}...`;
            div.appendChild(desc);
          }
        }
      }

      div.id = weekIteratorDate;
      if (
        div.id === currentDate &&
        weekIteratorMonth === this._date.getMonth() &&
        weekIteratorYear === this._date.getFullYear()
      ) {
        div.className = "today";
      } else if (
        type === "week" ||
        weekIteratorMonth === this._date.getMonth()
      ) {
        div.className = "dateBlock";
      } else {
        div.className = "blankDateBlock";
      }
      fragment.appendChild(div);
    }

    weekContainer.appendChild(fragment);
    this._displayNode.appendChild(weekContainer);
    this._displayNode.className = type;
  }

  /**
   * Sets the title to the active month name and year.
   * @private
   */
  _setTitle() {
    this._titleNode.replaceChildren(
      document.createTextNode(
        this._date.getMonthWord() + " " + this._date.getFullYear()
      )
    );
  }

  /**
   * Renders a full month grid.
   * Always draws 6 week rows so every month has the same calendar height
   * (leading/trailing days outside the active month use blankDateBlock).
   */
  displayMonth() {
    const type = "month";
    const weeksPerMonth = 6;
    this._clearDisplayDate();
    this._appendHeading(type);

    // Start at first day of month; _appendWeek expands each iteration to Sun–Sat.
    let monthIterator = this._date.getMonthStart();
    for (let week = 0; week < weeksPerMonth; week++) {
      this._appendWeek(monthIterator, type);
      monthIterator.incrementByWeek();
    }
    this._setTitle();
  }

  /**
   * Renders a single week.
   */
  displayWeek() {
    const type = "week";
    this._clearDisplayDate();
    this._appendHeading(type);
    this._appendWeek(this._date, type);
    this._setTitle();
  }

  /**
   * @param {Date} date
   */
  setDate(date) {
    this._date = new Date(date);
  }
}
