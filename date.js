/**
 * @file date.js
 * @description Calendar helpers on the native Date prototype (side-effect module).
 * Used by date-display.js and calendar.js for week/month navigation and YYYY_MM_DD keys.
 * @author Thomas Lane
 * @version $Revision: 453 $
 * $Date: 2012-01-17 15:38:39 -0800 (Tue, 17 Jan 2012) $
 * @modified G.E. Eidsness
 * @version $Revisions: 002 $
 * $Date: 2023-11-17 00:46:39 -0700 (Fri, 17 Nov 2023) $
 * $Date: 2026-07-28 11:36:29 -0700 (Tue, 28 July 2026) $
 */

// Separator for delimited date strings (matches jsonShows/ file naming)
Date.DELIM = "_";

// Week bounds (Sunday-start calendar)
Date.WEEKSTART = 0;
Date.WEEKEND = 6;

/**
 * @returns {string} Day of week as an English word
 */
Date.prototype.getDayWord = function () {
  return this.toLocaleDateString("en-US", { weekday: "long" });
};

/**
 * @returns {string} Month of year as an English word
 */
Date.prototype.getMonthWord = function () {
  // Use local month (not UTC) so names match getMonth()/getDelimDate()
  return this.toLocaleDateString("en-US", { month: "long" });
};

/**
 * @returns {Date} First day of this date's month
 */
Date.prototype.getMonthStart = function () {
  return new Date(this.getFullYear(), this.getMonth(), 1);
};

/**
 * @returns {Date} Last day of this date's month
 */
Date.prototype.getMonthEnd = function () {
  return new Date(this.getFullYear(), this.getMonth() + 1, 0);
};

/**
 * @returns {Date} First day of this date's week (Sunday)
 */
Date.prototype.getWeekStart = function () {
  return new Date(
    this.getFullYear(),
    this.getMonth(),
    this.getDate() - (this.getDay() - Date.WEEKSTART)
  );
};

/**
 * @returns {Date} Last day of this date's week (Saturday)
 */
Date.prototype.getWeekEnd = function () {
  return new Date(
    this.getFullYear(),
    this.getMonth(),
    this.getDate() + (Date.WEEKEND - this.getDay())
  );
};

/**
 * Mutates this date forward by one day.
 */
Date.prototype.incrementByDay = function () {
  this.setDate(this.getDate() + 1);
};

/**
 * Mutates this date backward by one day.
 */
Date.prototype.decrementByDay = function () {
  this.setDate(this.getDate() - 1);
};

/**
 * Mutates this date forward by seven days.
 */
Date.prototype.incrementByWeek = function () {
  this.setDate(this.getDate() + 7);
};

/**
 * Mutates this date backward by seven days.
 */
Date.prototype.decrementByWeek = function () {
  this.setDate(this.getDate() - 7);
};

/**
 * Mutates this date forward by one month, clamping the day if needed
 * (e.g. Jan 31 → Feb 28/29 instead of skipping to March).
 */
Date.prototype.incrementByMonth = function () {
  const firstNextMonth = new Date(this.getFullYear(), this.getMonth() + 1, 1);
  const sameDayNextMonth = new Date(
    this.getFullYear(),
    this.getMonth() + 1,
    this.getDate()
  );

  if (sameDayNextMonth.getMonth() !== firstNextMonth.getMonth()) {
    this.setDate(firstNextMonth.getMonthEnd().getDate());
    this.setMonth(firstNextMonth.getMonth());
  } else {
    this.setMonth(this.getMonth() + 1);
  }
};

/**
 * Mutates this date backward by one month, clamping the day if needed
 * (e.g. Mar 31 → Feb 28/29 instead of landing on Mar 2/3).
 */
Date.prototype.decrementByMonth = function () {
  const lastPrevMonth = this.getMonthStart();
  lastPrevMonth.decrementByDay();

  const sameDayPrevMonth = new Date(
    this.getFullYear(),
    this.getMonth() - 1,
    this.getDate()
  );

  if (sameDayPrevMonth.getTime() > lastPrevMonth.getTime()) {
    this.setDate(lastPrevMonth.getDate());
    this.setMonth(lastPrevMonth.getMonth());
  } else {
    this.setMonth(this.getMonth() - 1);
  }
};

/**
 * @returns {string} Date as YYYY_MM_DD (zero-padded month and day)
 */
Date.prototype.getDelimDate = function () {
  const year = this.getFullYear();
  const month = String(this.getMonth() + 1).padStart(2, "0");
  const day = String(this.getDate()).padStart(2, "0");
  return year + Date.DELIM + month + Date.DELIM + day;
};
