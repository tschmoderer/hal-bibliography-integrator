/**
 * Base URL for the HAL API.
 * This API allows querying scientific publications from the French open archive.
 * 
 * Documentation: https://api.archives-ouvertes.fr/docs/search
 */
const hal_api_url = "https://api.archives-ouvertes.fr/search";

/**
 * Call the HAL API with given query parameters.
 *
 * This function:
 * - Builds a query string from a parameters object
 * - Sends an HTTP GET request to the HAL API
 * - Parses the JSON response
 * - Returns the list of documents (`docs`) from the response
 *
 * @async
 * @function callHALAPI
 *
 * @param {Object} parameters - Query parameters for the HAL API.
 * Example:
 * {
 *   q: "machine learning",
 *   rows: 10,
 *   fl: "title_s,authFullName_s"
 * }
 *
 * @param {boolean} [debug=false] - If true, logs the generated URL for debugging.
 *
 * @returns {Promise<Array<Object>|undefined>}
 * A promise resolving to:
 * - An array of documents (`data.response.docs`) if successful
 * - `undefined` if an error occurs
 *
 * @throws Will not throw explicitly, but errors are caught and logged.
 *
 * @example
 * const results = await callHALAPI({
 *   q: "artificial intelligence",
 *   rows: 5
 * });
 * console.log(results);
 */
export async function callHALAPI(parameters, debug = false) {
    try {
        /**
         * Convert the parameters object into URL query parameters.
         * Example:
         * { q: "AI", rows: 10 } → "q=AI&rows=10"
         */
        const param = new URLSearchParams(parameters);

        /**
         * Create a URL object using the base HAL API endpoint.
         */
        var url = new URL(hal_api_url);

        /**
         * Attach the query string to the URL.
         */
        url.search = param.toString();

        /**
         * Debug mode: log the full request URL.
         */
        if (debug) {
            console.log("[HAL API REQUEST]", url.toString());
        }

        /**
        * Perform the HTTP request using Fetch API.
        * Note: This is an asynchronous network call.
        */
        const response = await fetch(url);

        /**
         * Parse the response body as JSON.
         */
        const data = await response.json();

        /**
               * Return only the relevant part of the response:
               * - `response.docs` contains the list of publications.
               */
        return data.response.docs;
    } catch (error) {
        /**
         * Error handling:
         * - Logs the URL that caused the error
         * - Logs the actual error for debugging
         */
        console.error("HAL API ERROR", {
            url: url?.toString(),
            error: error.message
        });

        throw error; // propagate error
    }
}