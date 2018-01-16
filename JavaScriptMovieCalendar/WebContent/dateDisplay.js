/**
 * @author Thomas Jane
 * @requires Date.js
 * @version $Revision: 229 $
 * $Date: 2011-01-16 19:08:49 -0800 (Sun, 16 Jan 2011) $
 * @modified G.E. Eidsness	
 * @version $Revision: 009 $
 * $Date: 2013-09-16 12:01:39 -0700 (Mon, 16 Sept 2013) $
 *
 * @class DateDisplay
 * Implements a weekly and monthly display of the days of week
 */

/**
 * @constructor
 * Instantiates the DateDisplay, setting the date, associating it with html elements for output
 *
 * post: The calendar is set to the date parameter but no displays have been updated.
 *
 * @param {HTMLElement} shortDateNode : the container element for output of the active date
 * @param {HTMLElement} displayNode : the container for output of the calendar
 * @param {HTMLElement} displayTitleNode : the container for output of calendar title
 * @param {Date} date : the default date for the calendar
 */

 function DateDisplay(displayDateNode, displayTitleNode, displayDetailsNode, activeDay){
    /**
     * The output HTMLElement for displaying the calendar
     * @private
     * @type HTMLElement
     */
    this._displayNode = displayDateNode;

    /**
     * The output HTMLElement for displaying the date display title
     * @private
     * @type HTMLElement
     */
    this._titleNode = displayTitleNode;
    this._detailsNode = displayDetailsNode;

    //Set the active date for the date display
    this.setDate(activeDay);
    //console.log("Active Date :" + activeDay);
}

/**
 * Removes all of the textnode children from the displayNode
 * post: _displayNode has no children
 * @private
 */
DateDisplay.prototype._clearDisplayDate = function (){
    while(this._displayNode.firstChild){
        this._displayNode.removeChild(this._displayNode.firstChild);
    }
};


/**
 * Appends a 2 letter day of the week abbreviations to the top of the date display display
 * @private
 */
DateDisplay.prototype._appendHeading = function (type){
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var heading = document.createElement("div");
    heading.id = "headingContainer";
    heading.className = type;
    for (var i in dayNames){
        var name = document.createTextNode(dayNames[i]);
        var div = document.createElement("div");
        div.className = "dayName";
        div.appendChild(name);
        heading.appendChild(div);
    }
    this._displayNode.appendChild(heading);
};

/**
 * Appends a series of child textnodes each day of the a week to the _displayNode element
 *     followed by a single br element.  Also sets the Title for the date display to the
 *     active days month and year
 * @private
 * @param {Date} day the date object used to loop through days in the week
 */

DateDisplay.prototype._appendWeek = function(day, type) {
	
	var d = new Date();
	var theDateToday =  d.getDelimDate();
    //console.log("TodaysDate: " + t);
    
    var weekContainer = document.createElement("div");
    weekContainer.id = "weekContainer";
    weekContainer.className = type

    for (var weekIterator = day.getWeekStart(); weekIterator <= day.getWeekEnd(); weekIterator.incrementByDay()) {
        var dayText = weekIterator.getDate();

        //set all days to be 2 characters in length
        if (dayText < 10) {
            var dateNumber = document.createTextNode("0" + dayText + " ");
        }
        else {
            var dateNumber = document.createTextNode(dayText + " ");
        }
        var ie7spacer = document.createElement("div");
        ie7spacer.className = "ie7spacer";
        var dateNumDiv = document.createElement("div");
        dateNumDiv.className = "dateNum";
        dateNumDiv.appendChild(dateNumber);
        var div = document.createElement("div");
        div.appendChild(ie7spacer);
        div.appendChild(dateNumDiv);
        var calendarDay = weekIterator.getDelimDate();
		//console.log("calendarDay :" + calendarDay);
		
        if (jsonShowings[calendarDay]) {
            for (var show in jsonShowings[calendarDay]) {
                var listing = document.createElement("div");
                var minutes = jsonShowings[calendarDay][show].date.getMinutes();
                minutes += "";
                if (minutes.length == 1) {
                    minutes = minutes + "0";
                }
                var movieData = document.createTextNode(jsonShowings[calendarDay][show].date.getUTCHours() + ":" + minutes
                    + " - " + jsonShowings[calendarDay][show].title);
                listing.appendChild(movieData);
                listing.id = jsonShowings[calendarDay][show].date.toISOString();
				//console.log("listing.id :" + listing.id);
                listing.className = "listing";
                if (type == "week") {
                    listing.appendChild(document.createElement("br"));
                    var movieDescription = document.createTextNode(jsonShowings[calendarDay][show].descr.substring(0, 130) + "...");
                    listing.appendChild(movieDescription);
                }
                div.appendChild(listing);
            }
        }
        
        if (weekIterator.getDelimDate() == theDateToday) {
            div.className = "todaysDate";
            console.log("Todays date :" + theDateToday);
        } 
        else if (weekIterator.getDelimDate() == this._date.getDelimDate()) {
            div.className = "today";          
            console.log("Select date :" + this._date.getDelimDate());
        }     
        else if (type == "week" || weekIterator.getMonth() == this._date.getMonth()) {
            div.className = "dateBlock";
        }
        else {
            div.className = "blankDateBlock";
        }

        div.id = weekIterator.getDelimDate();
		//console.log("div.id :" + div.id)
        weekContainer.appendChild(div);
    }
    this._displayNode.appendChild(weekContainer);
    this._displayNode.className = type;
};

/**
 * Clears all children from _displayNode
 * Appends a series of child nodes for each week of the month to _displayNode
 * and sets the Title for the date display to the active days month and year.
 */
DateDisplay.prototype.displayMonth = function (){
    var type = "month";
    this._clearDisplayDate();
    this._appendHeading(type);
    for( var monthIterator = this._date.getMonthStart();         //start at beginning of month
         monthIterator <= this._date.getMonthEnd().getWeekEnd(); //loop until the end of the last week that the month end falls in
         monthIterator.incrementByWeek())                        //increment the iterator by a week
    {
        this._appendWeek(monthIterator, type);
    }

    this._setTitle();
};

/**
 * Clears all children from _displayNode
 * Appends a series of child nodes for each day of the week to _displayNode
 * and sets the Title for the date display to the active days month and year.
 */
DateDisplay.prototype.displayWeek = function (){
    //If the display has previously been populated clear it
    var type = "week";
    this._clearDisplayDate();
    this._appendHeading(type);
    this._appendWeek(this._date, type);
    this._setTitle();
};

/**
 * Sets the _titleNode to the Month Name and Year for the active date
 * @private
 */
DateDisplay.prototype._setTitle = function(){
    if(this._titleNode.firstChild){
        this._titleNode.removeChild(this._titleNode.firstChild);
    }
    this._titleNode.appendChild(document.createTextNode(
        this._date.getMonthWord() + " " + this._date.getFullYear()));
};

/**
 * Sets the active date for the date display
 * @param {Date} date used used for setting date of date display
 */
DateDisplay.prototype.setDate = function(date){
    this._date = new Date(date);
};

