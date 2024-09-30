/**
 * @author G.E. Eidsness	
 * @version $Revision: 009 $
 * $Date: 2013-09-16 12:01:39 -0700 (Mon, 16 Sept 2013) $
 * @modified G.E. Eidsness
 * @version $Revision: 032 $
 * $Date: 2024-09-29 10:06:39 -0700 (Mon, 29 Sept 2024) $
 */

/**
 * Intialization for page
 * post: dateDisplay object will be instantiated with todays date
 * post: event handler will be set for setDate Button
 * post: event handler will be set for displayMonth Button
 * post: event handler will be set for displayWeek Button
 */

// Global constiables used by multiple files
let dateDisplay, targ, tag, jsonShowings;
let searchBtn, searchSubmit;
let title = undefined;

// Global variables used by multiple files
let request;
let userContext = {};
//const baseURL = "http://localhost/calendar/jsonShows/";
const baseURL = "./jsonShows/";

(function() {
  const init = function() {
    //create DateDisplay Object
    const displayDateNode = $("#dateDisplay")[0];
    const displayTitleNode = $("#displayTitle")[0];
    const displayDetailsNode = $("#details")[0];

    const todaysDate = new Date();

    //Create XMLHttpRequest -> acts as request/response object
    request = new XMLHttpRequest();
    // format month to mm
    let month = todaysDate.getMonth() + 1;
    month = formatMonth(month);
    let jsonFile = baseURL + todaysDate.getFullYear() + "_" + month + ".json";
    submitRequest(jsonFile);
    processResponse();
    dateDisplay = new DateDisplay(displayDateNode, displayTitleNode, displayDetailsNode, todaysDate);
    //Configure Nav Buttons
    $("#previous").click(function() {displayPrevious(); searchForTodaysListing();});
    $("#weekMonth").click(function() {switchView(); searchForTodaysListing();});
    $("#next").click(function() {displayNext(); searchForTodaysListing();});
    $("#goToDate").click(function() {goToDate();});
    $("#setDateSubmit").click(function() {setDateSubmit();});
    $("#search").click(function() {createSearchAndResultsField();});
    $("#dateDisplay").click(function() {setDateClick();});
    //document.getElementById("dateDisplay").onclick = setDateClick; //firefox fix 2014
    // set initial view to current month
    dateDisplay.displayMonth();
    searchForTodaysListing();
  };

  /**
   * format all months to mm
   */
  const formatMonth = function(month) {
    return month.toString().length == 2 ? month : "0" + month;
  };

  /** 
   * Notify user date selected is not available
  */
  const submitRequest = function(jsonFile) {
    try {
      request.open("GET", jsonFile, false);
      request.send(null);
      
      const fileNameParts = jsonFile.split('/').pop().split('.')[0].split('_');
      const year = fileNameParts[0];
      const month = new Date(year, parseInt(fileNameParts[1]) - 1).toLocaleString('default', { month: 'long' });
      
      if (request.status === 404) {
        const closestDate = findClosestAvailableDate(year, fileNameParts[1]);
        if (closestDate) {
          const closestMonth = closestDate.toLocaleString('default', { month: 'long' });
          const closestYear = closestDate.getFullYear();
          
          const userChoice = confirm(`Data for ${month} ${year} is not available. Click OK to view ${closestMonth} ${closestYear}.`);
          if (userChoice) {
            const newJsonFile = `${baseURL}${closestYear}_${formatMonth(closestDate.getMonth() + 1)}.json`;
            submitRequest(newJsonFile);
            setDate(closestYear, closestDate.getMonth() + 1, 1);
            return;
          }
        } else {
          alert(`No available data found near ${month} ${year}.`);
        }
        jsonShowings = { blank: {} };
      } else if (request.status !== 200) {
        alert(`Error loading data for ${month} ${year}`);
        console.error("HTTP error! status:", request.status);
        jsonShowings = { blank: {} };
      } else {
        processResponse();
      }
    } catch (error) {
      alert(`Error loading month data for ${month} ${year}`);
      console.error("submitRequest() error occurred: ", error);
      jsonShowings = { blank: {} };
    }
  };
 
  // Function to find the closest available date
  const findClosestAvailableDate = function(year, month) {
    const currentDate = new Date(year, month - 1);
    let futureDate = new Date(currentDate);
    let pastDate = new Date(currentDate);
    const maxAttempts = 12; // Check up to a year in either direction

    for (let i = 0; i < maxAttempts; i++) {
      // Check future date
      futureDate.setMonth(futureDate.getMonth() + 1);
      if (isDataAvailable(futureDate)) return futureDate;

      // Check past date
      pastDate.setMonth(pastDate.getMonth() - 1);
      if (isDataAvailable(pastDate)) return pastDate;
    }
    
    // If no data found within the range, return null or a default date
    return null;
  };
    
  // Function to check if data is available for a given date
  const isDataAvailable = function(date) {
    const jsonFile = `${baseURL}${date.getFullYear()}_${formatMonth(date.getMonth() + 1)}.json`;
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", jsonFile, false);
    xhr.send();
    return xhr.status === 200;
  };

  /**
   * Handles timeouts in accessing the JSON data/file.
   */
  const timeoutHandler = function() {
    //This cancels the previously sent request
    request.abort();
    //Inform the user of the timeout
    alert("Request Timed Out");
  };

  /** !!! original project mod !!!
   * The date format in jsonShowings needs to be an object.
   * But in the jsonShows file, the date is in string.
   */
  const adjustDateFormat = function() {
    Object.keys(jsonShowings).forEach((first) => {
      Object.keys(jsonShowings[first]).forEach((second) => {
        //2023-10-01T22:30:00.000Z
        jsonShowings[first][second]["date"] = new Date(jsonShowings[first][second]["date"]);
        //Sun Oct 01 2023 15:30:00 GMT-0700 (Pacific Daylight Time)
      });
    }); // Remove previous resultsDiv if exists
    let oldResultsDiv = document.getElementById("resultsDiv");
    if (oldResultsDiv) {
      console.log("*** oldResultsDiv ***");
      dateDisplay._detailsNode.removeChild(oldResultsDiv);
    }
  };

  /**
  * modified for "dateDisplay._detailsNode.lastChild"
  */
  const removeElementIfExists = function(id) {
    let element = document.getElementById(id);
    if (element && element === dateDisplay._detailsNode.lastChild) {
      element.parentNode.removeChild(element);
      console.log(`Removed element: ${id}`);
    }
  };

  /**
   * Process response from XMLHttpRequest and assign to global array
   */
  const processResponse = function() {
    try {
      if (request.readyState === 4) {
        //verify that request was successful
        if (request.status === 200) {
          jsonShowings = JSON.parse(request.responseText);
          adjustDateFormat(); // object -> string
        } else {
          // display blank fields if no json file
          jsonShowings = eval(function() {
            let showings = [];
            showings["blank"] = {};
            return showings;
          });
        }
      }
    } catch (error) {
      console.error("processResponse() error occurred: ", error);
    }
  };

  /** New function to handle the click event on the dateDisplay element.
   * Create movie details from XMLHttpRequest, send to Details div.
   **/
  const constructDetails = function(showingsDate, todaysListingId) {
    const todaysDate = new Date();
    const currentDate = todaysDate.getDelimDate();
    let date1 = Date.parse(currentDate.replace(/_/g, "-")); // "_" doesn't parse, "-" does.
    let date2 = undefined;
    let tag = undefined;
    
    try {
      removeElementIfExists("ajaxDetails");
      removeElementIfExists("searchDiv");
      removeElementIfExists("resultsDiv");  
      //Loop through newly created array of objects
      for (let i in showingsDate) {
        // if todaysListingId not null, set targ.id = todaysListingId
        if (todaysListingId) {
          targ = document.getElementById(todaysListingId);
        }
        tag = new Date(targ.id).toISOString(); // ("2023-10-11T03:00:00.000Z")  
        if (showingsDate[i].date.toISOString() == tag) {
          date2 = Date.parse(tag.split("T")[0]);  
          //Make minutes look nice
          let minutes = showingsDate[i].date.getMinutes().toString();
          minutes = minutes.length == 2 ? minutes : minutes + "0";  
          //Build movie detailsHTML for "ajaxDetails"
          let detailsHTML = `
            ${showingsDate[i].date.getUTCHours()}:${minutes} ${showingsDate[i].date.getMonthWord()} 
            ${showingsDate[i].date.getUTCDate()}<br><br>
            ${showingsDate[i].title}<br><br>
            ${showingsDate[i].dur} mins<br><br>
            ${showingsDate[i].descr}
          `;  
          // if date is today, add "Showing Today" to detailsHTML
          if (date1 === date2) {
            detailsHTML += "<br><br><br><span>***  Showing Today!  ***</span>";
            console.log("Showing Today!");
          }  
          //Build "ajaxDetails" for display
          let detailsDiv = document.createElement("div");
          detailsDiv.id = "ajaxDetails";
          detailsDiv.innerHTML = detailsHTML;
          dateDisplay._detailsNode.appendChild(detailsDiv);
        }
      }
    } catch (error) {
      alert("Parsing Failed :" + error.name + ": " + error.message);
    }
  };

  /**
   * function to search the loaded page for class="today"
   * if listing is present, update the details pane with first listing
   **/
  const searchForTodaysListing = function() {
    try {
      removeElementIfExists("searchDiv");
      removeElementIfExists("ajaxDetails");
      let todaysDateDiv = document.querySelector(".today");      
      if (todaysDateDiv && todaysDateDiv.id) {
        console.log("Today is: " + todaysDateDiv.id);
        let divs = Array.from(document.getElementsByClassName("listing"));        
        let found = divs.some(div => {
          if (div.id.split("T")[0].replace(/-/g, "_") == todaysDateDiv.id) {
            console.log("div.id:", div.id);
            constructDetails(jsonShowings[todaysDateDiv.id], div.id);
            return true;
          }
          return false;
        });  
        if (!found) {
          // Only display "No Listing Today" if the current month matches the displayed month
          if (todaysDateDiv.id.split('_')[1] === (dateDisplay._date.getMonth() + 1).toString().padStart(2, '0')) {
            let detailsHTML = `No Listing Today: ${dateDisplay._date.getDelimDate()}`;
            let detailsDiv = document.createElement("div");
            detailsDiv.id = "ajaxDetails";
            detailsDiv.innerHTML = detailsHTML;
            dateDisplay._detailsNode.appendChild(detailsDiv);
            console.log(detailsHTML);
          }
        }
      } else {
        console.log("Nothing for", dateDisplay._date.getDelimDate());
      }
    } catch (error) {
      console.error("searchForTodaysListing() error occurred: ", error);
    }
  };  
  
  /**
   * Click event handler for the dateDisplay.
   * if listing is present, update the details pane.
   **/
  const setDateClick = function(objEvent) {
    removeElementIfExists("resultsDiv");
    try {
      var objEvent = objEvent || window.event;
      targ = objEvent.srcElement ? objEvent.srcElement : objEvent.target;
      //console.log("targ: ", targ);
      if ((targ.className == "dateBlock") | (targ.className == "today")) {
        let targetId = targ.id.split("_");
        setDate(targetId[0], targetId[1], targetId[2]);
      } else if (
        (targ.parentNode.className == "dateBlock") |
        (targ.parentNode.className == "today")
      ) {
        let targetId = targ.parentNode.id.split("_");
        let targetDate = targetId[0] + "_" + targetId[1] + "_" + targetId[2];
        if (targ.className == "listing") {
          //console.log("targetDate: ", targetDate);
          constructDetails(jsonShowings[targetDate]); // XMLHttpRequest method
        }
        setDate(targetId[0], targetId[1], targetId[2]);
      }
    } catch (error) {
      console.error("setDateClick error occurred: ", error);
    }
  };

  /**
   * Create search panel appears with a search box with fields below
   */
  // Get the button element scoped (before "searchHTML")
  searchBtn = document.getElementById("searchBtn");
 
  const createSearchAndResultsField = function() {
    removeElementIfExists("ajaxDetails");
    removeElementIfExists("resultsDiv");
    let searchDiv = document.getElementById("searchDiv");
    let searchTerm = document.getElementById("searchTerm");
    if (!searchDiv) {
      // Create the search box, dropdown, and button using innerHTML
      let searchDiv = document.createElement("div");
      searchDiv.id = "searchDiv";
      searchDiv.innerHTML = `
        <input type="text" id="searchTerm" title="searchTerm" placeholder="Search Term">
        <select id="searchType" title="searchType" name="searchType">
          <option value="title">Title</option>
          <option value="descr">Description</option>
        </select>
        <input type="button" id="searchBtn" value="Search">
      `;
      searchDiv.querySelector("#searchBtn").onclick = searchSubmit; // Assuming searchSubmit is a globally accessible function
       // Append the parent div to the body or other container
      dateDisplay._detailsNode.appendChild(searchDiv);
      // if you want to append to a specific container
      // Use document.getElementById('parentContainer').appendChild(searchDiv);
    } else {
      clearDivBackgroundColor();
      if (searchTerm) {
        searchTerm.value = "";
      }
    }
 
    // Create a new resultsDiv for text
    let resultsDiv = document.createElement("div");
    resultsDiv.id = "resultsDiv";
    dateDisplay._detailsNode.appendChild(resultsDiv);
  };

  /**
  * If searchTerm ="title", search current month ("YYYY_MM.json")
  * in folder "jsonShows" and return matching titles.
  */
  async function fetchAsyncListing(url, title) {
    let matchedListings = [];
    let lowerCaseTitle = title.toLowerCase();
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const userContext = await response.json();
      for (let date in userContext) {
        let listings = userContext[date];
        for (let listing in listings) {
          let listingTitle = listings[listing]?.title?.toLowerCase();
          if (listingTitle === lowerCaseTitle) {
            matchedListings.push({
              title: listings[listing].title,
              date: listings[listing].date,
            });
          }
        }
      }
      return matchedListings;
    } catch (error) {
      console.error("Error:", error);
      return []; // Return empty array if fetch request fails
    } finally {
      console.info(`Title: ${title}, Count: ${matchedListings.length}`);
      if (matchedListings.length === 0) {
        console.log("No results for: " + title);
      }
    }
  };
    
  const searchSubmit = function() {
    clearDivBackgroundColor();
    let month = dateDisplay._date.getMonth() + 1;
    month = formatMonth(month);
    let jsonURL = baseURL + dateDisplay._date.getFullYear() + "_" + month + ".json";
    let searchTerm = document.querySelector("#searchTerm").value;
    let resultsDiv = document.querySelector("#resultsDiv");
    if (resultsDiv) resultsDiv.innerHTML = "";
    fetchAsyncListing(jsonURL, searchTerm).then((matchedListings) => {
      if (matchedListings.length === 0) {
        let msg = "No Search listings found";
        let breakElement = document.createElement("br");
        resultsDiv.appendChild(breakElement);
        let textNode = document.createTextNode(msg);
        resultsDiv.appendChild(textNode);
        console.log(msg);
        return;
      }
      if (!resultsDiv) {
        let msg = "No results div";
        console.log(msg);
        return;
      }
      matchedListings.forEach((listing) => {
        changeDivBackgroundColour(listing.date, "listing"); //div id="2023-11-18T23:30:00.000Z" class="listing"
        let listData = document.createTextNode(
          listing.title + " | " + listing.date
        );
        let breakElement = document.createElement("br");
        resultsDiv.appendChild(breakElement);
        resultsDiv.appendChild(listData);
      });
    });
  };
   
  const clearDivBackgroundColor = function() {
    // Select all elements with class "listing"
    const elements = document.querySelectorAll(".listing");
    // Loop through each element
    elements.forEach((el) => {
      // if element has a background color, clear it
      if (el.style.backgroundColor) {
        el.style.backgroundColor = "";
      }
    });
  };

  const changeDivBackgroundColour = function(id, className) {
    const bgColour = "orange";
    // Get the div with the specified id "YYYY-MM-DDTHH:mm:ss.sssZ"
    let div = document.getElementById(id);
    // Check if div exists and if it has the specified class
    if (div && div.classList.contains(className)) {
      // Change background color
      div.style.backgroundColor = bgColour;
    }
  };

  // highlight selected date cell with red border
  const matchDate = function(dateString) {
    try {
      removeElementIfExists("ajaxDetails");
      removeElementIfExists("searchDiv");
      removeElementIfExists("resultsDiv");  
      // Get the div element with the ID that matches the date string
      let targetDiv = document.getElementById(dateString);
      if (targetDiv) {
        console.log("targetDiv date:", targetDiv.id);
        targetDiv.style.borderColor = "red";
        this.calendar.onmousemove = function() {
          targetDiv.style.borderColor = "";
        };
        let divs = Array.from(document.getElementsByClassName("listing"));
  
        let found = divs.some(div => {
          if (div.id.split("T")[0].replace(/-/g, "_") == targetDiv.id) {
            console.log("div.id:", div.id); //"YYYY-MM-DDTHH:mm:ss.sssZ"
            constructDetails(jsonShowings[targetDiv.id], div.id); // XMLHttpRequest method
            return true;
          }
          return false;
        });
  
        if (!found) {
          // locate <div id="detailTitle">, notify user `No Listing Today:`
          let detailsHTML = `No Listing for today: ${targetDiv.id}`;
          let detailsDiv = document.createElement("div");
          detailsDiv.id = "ajaxDetails";
          detailsDiv.innerHTML = detailsHTML;
          dateDisplay._detailsNode.appendChild(detailsDiv);
          console.log(detailsHTML);
        }
      } else {
        console.log("targetDiv does not exist");
      }
    } catch (error) {
      console.error("matchDate() error occurred: ", error);
    }
  };
  
  /**
   * Shows the Go To Date form and hides the navigation buttons
   **/
  const goToDate = function() {
    clearDivBackgroundColor();
    removeElementIfExists("ajaxDetails");
    removeElementIfExists("searchDiv");
    removeElementIfExists("resultsDiv");
    document.getElementById("navButtons").className = "inactive";
    document.getElementById("navSearch").className = "active";
    document.getElementById("year").value = dateDisplay._date.getFullYear();
    document.getElementById("month").value = dateDisplay._date.getMonth() + 1;
    document.getElementById("day").value = dateDisplay._date.getDate();
    removeElementIfExists("searchDiv");
  };

  /**
   * Go To Date form Submit button onclick Event Handler
   * Sends a request to get the movie showings according to date
   * than hides the Go To Date form.
   **/
  const setDateSubmit = function() {
    //let todayDiv = document.getElementsByClassName("today");
    let month = document.getElementById("month").value;
    month = formatMonth(month);
    submitRequest(baseURL + document.getElementById("year").value + "_" + month + ".json");
    processResponse();
    setDate(
      document.getElementById("year").value,
      document.getElementById("month").value,
      document.getElementById("day").value
    );
    document.getElementById("navButtons").className = "active";
    document.getElementById("navSearch").className = "inactive";
    matchDate(dateDisplay._date.getDelimDate());
  };

  /** "Search" function
   * Sets the active date of the dateDisplay object from the
   * Year, Month, and Day text boxes
   * Note lack of error checking on date fields
   */
  const setDate = function(year, month, day) {
    let newDate = new Date(year, month - 1, day);
    dateDisplay.setDate(newDate);
    let type = document.getElementById("dateDisplay").className;
    if (type == "month") {
      dateDisplay.displayMonth() + 1;
    } else if (type == "week") {
      dateDisplay.displayWeek();
    }
  };

  /**
   * Week / Month button onclick Event Handler
   */
  const switchView = function() {
    removeElementIfExists("searchDiv");
    removeElementIfExists("resultsDiv");
    let type = document.getElementById("dateDisplay").className;
    if (type == "month") {
      dateDisplay.displayWeek();
    } else if (type == "week") {
      let month = dateDisplay._date.getMonth() + 1;
      month = formatMonth(month);
      submitRequest(baseURL + dateDisplay._date.getFullYear() + "_" + month + ".json");
      processResponse();
      dateDisplay.displayMonth();
    }
  };

  /**
   * displayPrevious button onclick Event Handler
   */
  const displayPrevious = function() {
    removeElementIfExists("ajaxDetails");
    removeElementIfExists("searchDiv");
    removeElementIfExists("resultsDiv");
    let type = document.getElementById("dateDisplay").className;
    if (type == "month") {
      dateDisplay._date.decrementByMonth();
      let month = dateDisplay._date.getMonth() + 1;
      month = formatMonth(month);
      submitRequest(baseURL + dateDisplay._date.getFullYear() + "_" + month + ".json");
      processResponse();
      dateDisplay.displayMonth();
    } else if (type == "week") {
      dateDisplay._date.decrementByWeek();
      let month = dateDisplay._date.getMonth() + 1;
      month = formatMonth(month);
      submitRequest(baseURL + dateDisplay._date.getFullYear() + "_" + month + ".json");
      processResponse();
      dateDisplay.displayWeek();
    }
  };

  /**
   * displayNext button onclick Event Handler
   */
  const displayNext = function() {
    removeElementIfExists("ajaxDetails");
    removeElementIfExists("searchDiv");
    removeElementIfExists("resultsDiv");
    let type = document.getElementById("dateDisplay").className;
    if (type == "month") {
      dateDisplay._date.incrementByMonth();
      let month = dateDisplay._date.getMonth() + 1;
      month = formatMonth(month);
      submitRequest(baseURL + dateDisplay._date.getFullYear() + "_" + month + ".json");
      processResponse();
      dateDisplay.displayMonth();
    } else if (type == "week") {
      dateDisplay._date.incrementByWeek();
      let month = dateDisplay._date.getMonth() + 1;
      month = formatMonth(month);
      submitRequest(baseURL + dateDisplay._date.getFullYear() + "_" + month + ".json");
      processResponse();
      dateDisplay.displayWeek();
    }
  };

  window.onload = init;

}());
