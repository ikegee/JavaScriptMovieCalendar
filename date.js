/**
 * @projectDescription Extends the native Date class to perform sundry calendar specific operations
 * @author Thomas Lane
 * @version $Revision: 453 $
 * $Date: 2012-01-17 15:38:39 -0800 (Tue, 17 Jan 2012) $
 * @modified G.E. Eidsness
 * @version $Revision: 015 $
 * $Date: 2023-11-17 00:46:39 -0700 (Fri, 17 Nov 2023) $
 */

//Delimiter Constant used as separator
const DELIM = "_";

//Calendar Related Enumerations
const DAYSOFWEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",];
const MONTHSOFYEAR = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",];
const THEFIRST = 1;
const DAYSINWEEK = 6;

/**
 * Returns the day value of the object as an english word
 * @return day of week as a word
 */
Date.prototype.getDayWord = function() {
  return DAYSOFWEEK[this.getDay()];
};

/**
 * Returns the month value of the object as an english word
 * @return month of year as a word
 */
Date.prototype.getMonthWord = function() {
  return MONTHSOFYEAR[this.getUTCMonth()];
};

/**
 * Returns a date object corresponding to the first day of the dates month
 * @return date
 */
Date.prototype.getMonthStart = function() {
  return new Date(this.getFullYear(), this.getMonth(), THEFIRST);
};

/**
 * Returns a date object corresponding to the last day of the dates month
 * @return date
 */
Date.prototype.getMonthEnd = function() {
  return new Date(this.getFullYear(), this.getMonth() + 1, 0);
};

/**
 * Returns a date object corresponding to the first day of the dates week
 * @return date
 */
Date.prototype.getWeekStart = function() {
  return new Date(
    this.getFullYear(),
    this.getMonth(),
    this.getDate() - this.getDay()
  );
};

/**
 * Returns a date object corresponding to the last day of the dates week
 * @return date
 */
Date.prototype.getWeekEnd = function() {
  return new Date(
    this.getFullYear(),
    this.getMonth(),
    this.getDate() + (DAYSINWEEK - this.getDay())
  );
};

/**
 * Increments the value of the date object as by a single day
 * post: the date will have been increased by a single day
 */
Date.prototype.incrementByDay = function() {
  this.setDate(this.getDate() + 1);
};

/**
 * Decrements the value of the date object as by a single day
 * post: the date will have been descreased by a single day
 */
Date.prototype.decrementByDay = function() {
  this.setDate(this.getDate() - 1);
};

/**
 * Increments the value of the date object by seven days
 * post: the date will have been increased by seven days
 */
Date.prototype.incrementByWeek = function() {
  this.setDate(this.getDate() + 7);
};

/**
 * Decrements the value of the date object by seven days
 * post: the date will have been decreased by seven days
 */
Date.prototype.decrementByWeek = function() {
  this.setDate(this.getDate() - 7);
};

/** fixed 2024-08-17 00:46:39 -0700 (Fri, 17 Nov 2023)
 * Increments the value of the date object by a month
 * Only results in a single month increase
 * post: the date will have been increased by a single month
 */
Date.prototype.incrementByMonth = function() {
    this.setMonth(this.getMonth() + 1);
  };

/**
 * Decrements the value of the date object by a month
 * Always results in a single month decrease
 * post: the date will have been increased by a single month
 */
Date.prototype.decrementByMonth = function() {
  this.setMonth(this.getMonth() - 1);
};

/** !! Important !!
 * Returns value of the date object in the form YYYY_MM_DD
 * with the possibility of single digit months and days
 * @return 	string
 */
Date.prototype.getDelimDate = function() {
  let day = this.getDate().toString().padStart(2, '0');
  let month = (this.getMonth() + 1).toString().padStart(2, '0');
  let year = this.getFullYear();
  return `${year}${DELIM}${month}${DELIM}${day}`;
};

