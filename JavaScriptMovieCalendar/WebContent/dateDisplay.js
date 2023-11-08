/**
 * @author Thomas Lane
 * @requires Date.js
 * @version $Revision: 229 $
 * $Date: 2011-01-16 19:08:49 -0800 (Sun, 16 Jan 2011) $
 * @modified G.E. Eidsness
 * @version $Revision: 025 $
 * $Date: 2023-10-24 23:01:39 -0700 (Tue, 24 Oct 2023) $
 */
 

/**
 * @class DateDisplay
 * Implements a weekly and monthly display of days of week
 */
class DateDisplay {
  /**
   * Creates a new DateDisplay instance.
   *
   * @param {HTMLElement} dateNode - The output HTMLElement for displaying the calendar.
   * @param {HTMLElement} titleNode - The output HTMLElement for displaying the date display title.
   * @param {HTMLElement} detailsNode - The output HTMLElement for displaying the selected movie showing.
   * @param {Date} activeDay - The active date for the date display.
   */
  constructor(dateNode, titleNode, detailsNode, activeDay) {
    this._displayNode = dateNode;
    this._titleNode = titleNode;
    this._detailsNode = detailsNode;
    this.setDate(activeDay);
  }
  /**
   * Removes all of the textnode children from the displayNode
   * post: _displayNode has no children
   * @private
   */
  _clearDisplayDate() {
    while (this._displayNode.firstChild) {
      this._displayNode.removeChild(this._displayNode.firstChild);
    }
  }
  /**
   * Appends a 2 letter day of the week abbreviations to the top of the date display
   * @private
   */
  _appendHeading(type) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",];
    let heading = document.createElement("div");
    heading.id = "headingContainer";
    heading.className = type;
    for (let i in dayNames) {
      let name = document.createTextNode(dayNames[i]);
      let div = document.createElement("div");
      div.className = "dayName";
      div.appendChild(name);
      heading.appendChild(div);
    }
    this._displayNode.appendChild(heading);
  }  
  /**
   * Appends a series of child textnodes each day of the a week to the _displayNode element
   *     followed by a single br element.  Also sets the Title for the date display to the
   *     active days month and year
   * @private
   * @param {Date} day the date object used to loop through days in the week
   */
  _appendWeek(day, type) {
    let weekContainer = document.createElement("div");
    weekContainer.id = "weekContainer";
    weekContainer.className = type;
    for (let weekIterator = day.getWeekStart(); weekIterator <= day.getWeekEnd(); weekIterator.incrementByDay()) {
      let dayText = weekIterator.getDate();
      //set all days to be 2 characters in length
      let dateNumber = document.createTextNode(
        dayText.toString().padStart(2, "0") + " "
      );
      let divSpacer = document.createElement("div");
      divSpacer.className = "divSpacer";
      let dateNumDiv = document.createElement("div");
      dateNumDiv.className = "dateNum";
      dateNumDiv.appendChild(dateNumber);
      let div = document.createElement("div");
      div.appendChild(divSpacer);
      div.appendChild(dateNumDiv);
      let calendarDay = weekIterator.getDelimDate();
      let showings = jsonShowings[calendarDay];
      if (showings) {
        for (let show in showings) {
          let minutes = showings[show].date.getMinutes().toString();
          minutes = minutes.length == 1 ? `${minutes}0` : minutes;
          let movieData = `${showings[show].date.getUTCHours()}:${minutes} - ${showings[show].title}`;
          let listing = `<div id="${showings[show].date.toISOString()}" class="listing">${movieData}</div>`;
          if (type == "week") {
            let movieDescription = `${showings[show].descr.substring(0, 120)}...`;
            listing += `${movieDescription}`;
          }
          div.innerHTML += listing;
        }
      }
      /**
       * if type is "month" set class to "today" if div id is same as current date,
       * otherwise set the class to "dateBlock" if the month is the same as the current month,
       * otherwise set the class to "blankDateBlock"
       */
      let currentDate = new Date().getDelimDate();
      div.id = weekIterator.getDelimDate();
      if (div.id == currentDate) {
        div.className = "today";
        div.style.backgroundColor = "#ede2c5";
      } else if (type == "week" || weekIterator.getMonth() == this._date.getMonth()) {
        div.id == currentDate ? (div.className = "today") : (div.className = "dateBlock");
      } else {
        div.className = "blankDateBlock";
      }
      weekContainer.appendChild(div);
    }
    this._displayNode.appendChild(weekContainer);
    this._displayNode.className = type;
  }
  /**
   * Clears all children from _displayNode
   * Appends a series of child nodes for each week of the month to _displayNode
   * and sets the Title for the date display to the active days month and year.
   */
  displayMonth() {
    let type = "month";
    this._clearDisplayDate();
    this._appendHeading(type);
    for (
      let monthIterator = this._date.getMonthStart(); //start at beginning of month
      monthIterator <= this._date.getMonthEnd().getWeekEnd(); //loop until the end of the last week that the month end falls in
      monthIterator.incrementByWeek() //increment the iterator by a week
    ) {
      this._appendWeek(monthIterator, type);
    }
    //this._loadTodaysListing();
    this._setTitle();
  }
  /**
   * Clears all children from _displayNode
   * Appends a series of child nodes for each day of the week to _displayNode
   * and sets the Title for the date display to the active days month and year.
   */
  displayWeek() {
    //If the display has previously been populated clear it
    let type = "week";
    this._clearDisplayDate();
    this._appendHeading(type);
    this._appendWeek(this._date, type);
    this._setTitle();
  }
  /**
   * Sets the _titleNode to the Month Name and Year for the active date
   * @private
   */
  _setTitle() {
    if (this._titleNode.firstChild) {
      this._titleNode.removeChild(this._titleNode.firstChild);
    } // current month and year
    this._titleNode.appendChild(document.createTextNode(
        this._date.getMonthWord() + " " + this._date.getFullYear()
      )
    );
  }
  /**
   * Sets the active date for the date display
   * @param {Date} date used used for setting date of date display
   */
  setDate(date) {
    this._date = new Date(date);
  }
}











