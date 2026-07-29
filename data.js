/**
 * @file data.js
 * @description Load and search movie showings from jsonShows/*.json
 * @author G.E. Eidsness	
 * @version $Revision: 009 $
 * $Date: 2013-09-16 12:01:39 -0700 (Mon, 16 Sept 2013) $
 * @version $Revisions: 003 $
 * $Date: 2023-11-17 00:46:39 -0700 (Fri, 17 Nov 2023) $
 * $Date: 2024-09-29 10:06:39 -0700 (Mon, 29 Sept 2024) $
 * @version $Rewrite: 001 $
 * $Date: 2026-07-28 11:36:29 -0700 (Tue, 28 July 2026) $
*/

/**
 * @typedef {Object} Showing
 * @property {Date|string} date
 * @property {string} title
 * @property {number} dur
 * @property {string} descr
 */

export const baseURL = "./jsonShows/";

/** @type {Object.<string, Object.<string, Showing>>} */
export let jsonShowings = { blank: {} };

/**
 * @param {string|number} n
 * @returns {string}
 */
export const pad2 = (n) => String(n).padStart(2, "0");

/**
 * @param {string|number} year
 * @param {string|number} month1Based
 * @returns {string}
 */
export const monthJsonUrl = (year, month1Based) =>
  `${baseURL}${year}_${pad2(month1Based)}.json`;

/**
 * @param {string} jsonFile
 * @returns {{ year: string, monthNum: number }}
 */
const parseYearMonthFromUrl = (jsonFile) => {
  const parts = jsonFile.split("/").pop().split(".")[0].split("_");
  return { year: parts[0], monthNum: parseInt(parts[1], 10) };
};

/**
 * @param {string|number} year
 * @param {string|number} month1Based
 * @returns {string}
 */
const monthName = (year, month1Based) =>
  new Date(year, month1Based - 1).toLocaleString("default", { month: "long" });

/**
 * Convert showing date strings from JSON into Date objects (in place).
 * @param {Object.<string, Object.<string, Showing>>} data
 */
const adjustDateFormat = (data) => {
  Object.values(data).forEach((day) => {
    Object.values(day).forEach((showing) => {
      if (showing && showing.date) {
        showing.date = new Date(showing.date);
      }
    });
  });
};

/**
 * @param {Date} date
 * @returns {Promise<boolean>}
 */
export const isDataAvailable = async (date) => {
  const url = monthJsonUrl(date.getFullYear(), date.getMonth() + 1);
  try {
    let response = await fetch(url, { method: "HEAD" });
    // Some static hosts disallow HEAD; fall back to GET.
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, { method: "GET" });
    }
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * @param {string|number} year
 * @param {string|number} month1Based
 * @returns {Promise<Date|null>}
 */
export const findClosestAvailableDate = async (year, month1Based) => {
  const currentDate = new Date(Number(year), Number(month1Based) - 1);
  const futureDate = new Date(currentDate);
  const pastDate = new Date(currentDate);
  const maxAttempts = 12;

  for (let i = 0; i < maxAttempts; i++) {
    futureDate.setMonth(futureDate.getMonth() + 1);
    if (await isDataAvailable(futureDate)) return futureDate;

    pastDate.setMonth(pastDate.getMonth() - 1);
    if (await isDataAvailable(pastDate)) return pastDate;
  }
  return null;
};

/**
 * Load a month JSON file into jsonShowings.
 * On 404, offers the closest available month (confirm dialog).
 *
 * @param {string} jsonFile
 * @returns {Promise<{ ok: boolean, navigateTo: Date|null }>}
 *   navigateTo is set when the user accepts a fallback month (day 1).
 */
export const loadShowings = async (jsonFile) => {
  const { year, monthNum } = parseYearMonthFromUrl(jsonFile);
  const label = `${monthName(year, monthNum)} ${year}`;

  try {
    const response = await fetch(jsonFile);

    if (response.status === 404) {
      const closestDate = await findClosestAvailableDate(year, monthNum);
      if (closestDate) {
        const closestLabel = `${closestDate.toLocaleString("default", {
          month: "long",
        })} ${closestDate.getFullYear()}`;
        const userChoice = confirm(
          `Data for ${label} is not available. Click OK to view ${closestLabel}.`
        );
        if (userChoice) {
          const newJsonFile = monthJsonUrl(
            closestDate.getFullYear(),
            closestDate.getMonth() + 1
          );
          await loadShowings(newJsonFile);
          return { ok: true, navigateTo: closestDate };
        }
      } else {
        alert(`No available data found near ${label}.`);
      }
      jsonShowings = { blank: {} };
      return { ok: false, navigateTo: null };
    }

    if (!response.ok) {
      alert(`Error loading data for ${label}`);
      console.error("HTTP error! status:", response.status);
      jsonShowings = { blank: {} };
      return { ok: false, navigateTo: null };
    }

    jsonShowings = await response.json();
    adjustDateFormat(jsonShowings);
    return { ok: true, navigateTo: null };
  } catch (error) {
    alert(`Error loading month data for ${label}`);
    console.error("loadShowings() error:", error);
    jsonShowings = { blank: {} };
    return { ok: false, navigateTo: null };
  }
};

/**
 * Search a month JSON for title/description matches.
 * @param {string} url
 * @param {string} term
 * @param {string} [searchType="title"] "title" | "descr"
 * @returns {Promise<Array<{title: string, date: string}>>}
 */
export const fetchAsyncListing = async (url, term, searchType = "title") => {
  const matched = [];
  const needle = term.toLowerCase();
  if (!needle) return matched;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    for (const dateKey of Object.keys(data)) {
      const listings = data[dateKey];
      for (const listingKey of Object.keys(listings)) {
        const item = listings[listingKey];
        const field = (item[searchType] || "").toLowerCase();
        if (field.includes(needle)) {
          matched.push({
            title: item.title,
            date: item.date,
          });
        }
      }
    }
    return matched;
  } catch (error) {
    console.error("fetchAsyncListing error:", error);
    return [];
  }
};
