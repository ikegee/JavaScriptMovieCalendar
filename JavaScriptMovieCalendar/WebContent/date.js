/**
 * @projectDescription Extends the native Date class to perform sundry calendar specific operations
 * @author Thomas Jane
 * @version $Revision: 453 $
 * $Date: 2012-01-17 15:38:39 -0800 (Tue, 17 Jan 2012) $
 * @modified G.E. Eidsness	
 * @version $Revision: 009 $
 * $Date: 2014-09-16 12:01:39 -0700 (Mon, 16 Sept 2014) $
 */

//Delimiter Constant used as separator
Date.DELIM ="_";

//Calendar Related Enumerations
Date.DAYSOFWEEK = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
Date.MONTHSOFYEAR = ['January','February','March','April','May','June','July','August','September','October','November','December'];
Date.THEFIRST = 1;
Date.DAYSINWEEK = 6;
Date.WEEKSTART = 0;
Date.WEEKEND = 6;

/**
 * Returns the day value of the object as an english word
 * @return day of week as a word
 */
Date.prototype.getDayWord = function(){
    return Date.DAYSOFWEEK[this.getDay()];
};

/**
 * Returns the month value of the object as an english word
 * @return month of year as a word
 */
Date.prototype.getMonthWord = function(){
    return Date.MONTHSOFYEAR[this.getUTCMonth()];
};

/**
 * Returns a date object corresponding to the first day of the dates month
 * @return date
 */
Date.prototype.getMonthStart = function(){
    return new Date(this.getFullYear(),this.getMonth(),Date.THEFIRST);
};

/**
 * Returns a date object corresponding to the last day of the dates month
 * @return date
 */
Date.prototype.getMonthEnd = function(){
    return new Date(this.getFullYear(),this.getMonth()+1,0);
};

/**
 * Returns a date object corresponding to the first day of the dates week
 * @return date
 */
Date.prototype.getWeekStart = function(){
    return new Date(this.getFullYear(),this.getMonth(),this.getDate()-this.getDay());
};

/**
 * Returns a date object corresponding to the last day of the dates week
 * @return date
 */
Date.prototype.getWeekEnd = function (){
    return new Date(this.getFullYear(),this.getMonth(),this.getDate()+(Date.DAYSINWEEK-this.getDay()));
};

/**
 * Increments the value of the date object as by a single day
 * post: the date will have been increased by a single day
 */
Date.prototype.incrementByDay = function (){
    this.setDate(this.getDate()+1);
};

/**
 * Decrements the value of the date object as by a single day
 * post: the date will have been descreased by a single day
 */
Date.prototype.decrementByDay = function (){
    this.setDate(this.getDate()-1);
};

/**
 * Increments the value of the date object by seven days
 * post: the date will have been increased by seven days
 */
Date.prototype.incrementByWeek = function (){
    this.setDate(this.getDate()+7);
};

/**
 * Decrements the value of the date object by seven days
 * post: the date will have been decreased by seven days
 */
Date.prototype.decrementByWeek = function (){
    this.setDate(this.getDate()-7);
};

/**
 * Increments the value of the date object by a month
 * Only results in a single month increase
 * post: the date will have been increased by a single month
 */
Date.prototype.incrementByMonth = function (){
    var firstNextMonth = new Date(this.getFullYear(),this.getMonth()+1,Date.THEFIRST);
    var incrementedMonth = new Date(this.getFullYear(),this.getMonth()+1,this.getDate());
    //Following determines if we are attempting to advance to a month with less days than
    //the month which presently has focus.
    if (incrementedMonth.getMonth() > firstNextMonth.getMonth()){
        //If true advance date to the last day of the next month
        //in order to avoid skipping a month
        //The following operations must be undertaken in this order
        //as attempting to advance the month while the date is larger than the
        //maximum days in the month results in advancing the month
        this.setDate(firstNextMonth.getMonthEnd().getDate());
        this.setMonth(firstNextMonth.getMonth());

    }else{
        this.setMonth(this.getMonth()+1);
    }
    console.log("incrementByMonth:" + month);
};

/**
 * Decrements the value of the date object by a month
 * Always results in a single month decrease
 * post: the date will have been increased by a single month
 */
Date.prototype.decrementByMonth = function (){

    //Following two statements gets the last day of the previous month
    var lastPrevMonth = this.getMonthStart();
    lastPrevMonth.decrementByDay();

    var decrementedMonth = new Date(this.getFullYear(),this.getMonth()-1,this.getDate());

    //Following determines if we are attempting to advance to a month with less days than
    //the month which presently has focus.
    //if (decrementedMonth > lastPrevMonth){
    if (decrementedMonth.getTime() > lastPrevMonth.getTime()){
        //If true set date to the last day of the previous month
        //in order to avoid having a result date in the same month
        //The following operations must be undertaken in this order
        //as attempting to move back the month while the date is larger than
        //the maximum days in the month results in advancing to the first of
        //the current month
        this.setDate(lastPrevMonth.getDate());
        this.setMonth(lastPrevMonth.getMonth());
    }else{
        this.setMonth(this.getMonth()-1);
    }
    console.log("incrementByMonth: " + month);
};

/**
 * Returns value of the date object in the form YYYY_MM_DD
 * with the possibility of single digit months and days
 * @return 	string
 */
Date.prototype.getDelimDate = function(){
    var day = null;
    var month = null;

    if(this.getDate() < 10){
        day = "0" + this.getDate();
    }else{
        day = this.getDate();
    }
    // remember get month returns zero indexed month of year, i.e. January = 0
    if(this.getMonth() < 9){
        //month = "0" + this.getMonth();
        month = "0" + (this.getMonth() + 1);
    }else{
       // month = this.getMonth();
        month = (this.getMonth() + 1);
    }
    //alert("getDelimDate: " + month);
    return this.getFullYear() + Date.DELIM + month + Date.DELIM + day;
};
