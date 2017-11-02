/**
 * @author G.E. Eidsness	
 * @version $Revision: 009 $
 * $Date: 2013-09-16 12:01:39 -0700 (Mon, 16 Sept 2013) $
 *
 * Initialization for page
 * post: dateDisplay object will be instantiated with todays date
 * post: event handler will be set for setDate Button
 * post: event handler will be set for displayMonth Button
 * post: event handler will be set for displayWeek Button
 */
 
// Global variables used by multiple files
var dateDisplay, targ, tag, jsonShowings;

(function () {

var init = function() {
    //create DateDisplay Object
    var displayDateNode = $('#dateDisplay')[0];
    var displayTitleNode = $('#displayTitle')[0];
    var displayDetailsNode = $('#details')[0];

    var todaysDate = new Date();

    //Create XMLHttpRequest -> acts as request/response object
    request = new XMLHttpRequest();

    // format month to mm
    var month = (todaysDate.getMonth()+1);
    month = formatMonth(month);

    var jsonFile = "./jsonShows/" + todaysDate.getFullYear() + "_" + month + ".json";
    submitRequest(jsonFile);
    processResponse();

    dateDisplay = new DateDisplay(displayDateNode, displayTitleNode, displayDetailsNode, todaysDate);

    //Configure Nav Buttons
    $('#previous').click(function(){displayPrevious()});
    $('#weekMonth').click(function(){switchView()});
    $('#next').click(function(){displayNext()});
    $('#goToDate').click(function(){goToDate()});
    $('#setDateSubmit').click(function(){setDateSubmit()});
    $('#search').click(function(){search()});
    //$('#dateDisplay').click(function(){setDateClick()});
    document.getElementById("dateDisplay").onclick = setDateClick; //firefox fix

    // set initial view to current month
    dateDisplay.displayMonth();
};

/**
 * format all months to mm
 */
var formatMonth = function(month){
    month = (month.toString().length == 2 ? month : "0" + month);
    return month;
};

/**
 * Submit the XMLHttpRequest with the current month and year filename as parameter
 **/
var submitRequest = function(jsonFile) {
    request.open("GET", jsonFile, false);
    request.setRequestHeader("User-Agent", "XMLHttpRequest");
    request.send(null);
};

/**
 * Handles timeouts in accessing the JSON data/file.
 */
var timeoutHandler = function () {
    //This cancels the previously sent request
    request.abort();
    //Inform the user of the timeout
    alert("Request Timed Out");
};

/**
* The date format in jsonShowings needs to be an object. But in the jsonShows file,
* the date is in string.
**/
var adjustDateFormat = function() {
    var element = null;
    for(var first in jsonShowings) {
        for(var second in jsonShowings[first]) {
            element = jsonShowings[first][second]["date"];
            jsonShowings[first][second]["date"] = new Date(element);
         }
     }
};

/**
 * Process the response from the XMLHttpRequest and assign it to a global array
 **/
var processResponse = function() {
    if (request.readyState === 4) {
        //verify that request was successful
        if (request.status === 200) {
            jsonShowings = $.parseJSON(request.responseText);
            adjustDateFormat();
         } else {
            // display blank fields if no json file
            jsonShowings = eval(function () {
            var showings = [];
            showings["blank"] = {};
            return showings;
            });
        }
    }
}

/**
 * Create movie details from XMLHttpRequest, send to Details div.
 **/
var constructDetails = function(showingsDate) {

    var detailsDiv, detailsContent, titleString, startDateString, durationString, descriptionString, minutes;
    var currentDate = dateDisplay._date.getDelimDate();
	console.log("currentDate :" + currentDate);
                 
    try {
        detailsDiv = document.createElement("div");

        //Remove previous details if present
        if (dateDisplay._detailsNode.lastChild == document.getElementById("ajaxDetails")) {
            dateDisplay._detailsNode.removeChild(document.getElementById("ajaxDetails"));
        }
        //Loop through newly created array of objects
        for (i in showingsDate) {
			tag = new Date(targ.id).toISOString();
			//console.log("tag: " + tag);
            if (showingsDate[i].date.toISOString() ==  tag) {
				//console.log("showingsDate[i].date: " + showingsDate[i].date.toISOString());
				//console.log("targ.id: " + targ.id);

                // title
                titleString = document.createTextNode(showingsDate[i].title);

                //Make minutes look like nice
                minutes = showingsDate[i].date.getMinutes().toString();
                minutes = (minutes.length == 2 ? minutes : minutes + "0" );

                startDateString = document.createTextNode(showingsDate[i].date.getUTCHours()
                + ":" + minutes
                + " " + showingsDate[i].date.getMonthWord()
                + " " + showingsDate[i].date.getUTCDate() );

				// duration
                durationString = document.createTextNode(showingsDate[i].dur + " mins");

                // description
                descriptionString = document.createTextNode(showingsDate[i].descr);

                //render data
                detailsDiv.appendChild(startDateString);
                detailsDiv.appendChild(document.createElement("br"));
                detailsDiv.appendChild(document.createElement("br"));
                detailsDiv.appendChild(titleString);
                detailsDiv.appendChild(document.createElement("br"));
                detailsDiv.appendChild(document.createElement("br"));
                detailsDiv.appendChild(durationString);
                detailsDiv.appendChild(document.createElement("br"));
                detailsDiv.appendChild(document.createElement("br"));
                detailsDiv.appendChild(descriptionString);

                detailsDiv.id = "ajaxDetails";
                dateDisplay._detailsNode.appendChild(detailsDiv);
            }
        }
    }
    catch (error) {
        //Display error
        alert("Parsing Failed :" + error.name + ": " + error.message);
    }
};

/**
 * Event listener for the calendar days and the listings.
 * if listing is present, update the details pane.
 **/
var setDateClick = function(objEvent) {

    if (!objEvent) var objEvent = window.event;

    if (objEvent.srcElement) { targ = objEvent.srcElement; }
    else if (objEvent.target) { targ = objEvent.target; }

    if (targ.className == "dateBlock" | targ.className == "today") {
        var targetId = targ.id.split("_");
		//console.log("targetId: " + targetId);
		
        setDate(targetId[0], targetId[1], targetId[2]);
    }
    else if (targ.parentNode.className == "dateBlock" | targ.parentNode.className == "today") {
        var targetId = targ.parentNode.id.split("_");
		//console.log("targetId: " + targetId);
        var targetDate = targetId[0] + "_" + targetId[1] + "_" + targetId[2];
        if (targ.className == "listing") {
            constructDetails(jsonShowings[targetDate]);
        }
		//console.log("targetDate: " + targetDate);
        setDate(targetId[0], targetId[1], targetId[2]);
    }
};

/**
 * search function
 */
 var search = function() {
	alert("Coming Soon!"); 
 };

/**
 * Shows the Go To Date form and hides the navigation buttons
 **/
var goToDate = function() {
    document.getElementById("navButtons").className = "inactive";
    document.getElementById("navSearch").className = "active";

    document.getElementById("year").value = dateDisplay._date.getFullYear();
    document.getElementById("month").value = (dateDisplay._date.getMonth() + 1);
    document.getElementById("day").value = dateDisplay._date.getDate();
};

/**
 * Go To Date form Submit button onclick Event Handler
 * Sends a request to get the movie showings according to date
 * than hides the Go To Date form.
 **/
var setDateSubmit = function() {
    // clear details pane
    $("#ajaxDetails").empty();

    var month = (document.getElementById("month").value);
    month = formatMonth(month);

    submitRequest("./jsonShows/" + document.getElementById("year").value + "_" + month + ".json");
    processResponse();
    setDate(document.getElementById("year").value,
        document.getElementById("month").value,
        document.getElementById("day").value);

    document.getElementById("navButtons").className = "active";
    document.getElementById("navSearch").className = "inactive";
};

/**
 * Sets the active date of the dateDisplay object from the
 * Year, Month, and Day text boxes
 * Note lack of error checking on date fields
 */
var setDate = function(year, month, day) {

    var newDate = new Date(year, month-1, day);
    dateDisplay.setDate(newDate);
    var type = document.getElementById("dateDisplay").className;
    if (type == "month") {
        (dateDisplay.displayMonth() + 1);
    }
    else if (type == "week") {
        dateDisplay.displayWeek();
    }
};

/**
 * Week / Month button onclick Event Handler
 */
var switchView = function() {
    $("#ajaxDetails").empty();
    var type = document.getElementById("dateDisplay").className;
    if (type == "month") {
        dateDisplay.displayWeek();
    }
    else if (type == "week") {
        var month = (dateDisplay._date.getMonth() + 1);
        month = formatMonth(month);

        submitRequest("./jsonShows/" + dateDisplay._date.getFullYear() + "_" + month + ".json");
        processResponse();
        dateDisplay.displayMonth();
    }
};

/**
 * displayPrevious button onclick Event Handler
 */
var displayPrevious = function() {
    var type = document.getElementById("dateDisplay").className;
    if (type == "month") {
        dateDisplay._date.decrementByMonth();
        var month = (dateDisplay._date.getMonth() + 1);
        month = formatMonth(month);

        submitRequest("./jsonShows/" + dateDisplay._date.getFullYear() + "_" + month + ".json");
        processResponse();
        dateDisplay.displayMonth();
    }
    else if (type == "week") {
        dateDisplay._date.decrementByWeek();
        var month = (dateDisplay._date.getMonth() + 1);
        month = formatMonth(month);

        submitRequest("./jsonShows/" + dateDisplay._date.getFullYear() + "_" + month + ".json");
        processResponse();
        dateDisplay.displayWeek();
    }
    if (dateDisplay._detailsNode.lastChild == document.getElementById("ajaxDetails")) {
        dateDisplay._detailsNode.removeChild(document.getElementById("ajaxDetails"));
    }
};

/**
 * displayNext button onclick Event Handler
 */
var displayNext = function() {
    var type = document.getElementById("dateDisplay").className;
    if (type == "month") {
        dateDisplay._date.incrementByMonth()
        var month = (dateDisplay._date.getMonth() + 1);
        month = formatMonth(month);

        submitRequest("./jsonShows/" + dateDisplay._date.getFullYear() + "_" + month + ".json");
        processResponse();
        dateDisplay.displayMonth();
    }
    else if (type == "week") {
        dateDisplay._date.incrementByWeek();
        var month = (dateDisplay._date.getMonth() + 1);
        month = formatMonth(month);

        submitRequest("./jsonShows/" + dateDisplay._date.getFullYear() + "_" + month + ".json");
        processResponse();
        dateDisplay.displayWeek();
    }
    if (dateDisplay._detailsNode.lastChild == document.getElementById("ajaxDetails")) {
        dateDisplay._detailsNode.removeChild(document.getElementById("ajaxDetails"));
    }
};

window.onload = init;

}());


