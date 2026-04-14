// export function fetchJournalData(journalISSN, config, debug) {
//   return new Promise((resolve, reject) => {
//     const apiKey = config["scopus"]["apiKey"];

//     fetch(`https://api.elsevier.com/content/serial/title/issn/${encodeURIComponent(journalISSN)}?apiKey=${apiKey}`)
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         return response.json();
//       })
//       .then(data => {
//         // Process the fetched data
//         if (debug) {
//           console.log(data);
//         }

//         const journal = data['serial-metadata-response'].entry[0];
//         const citeScore = journal['citeScoreYearInfoList']['citeScoreCurrentMetric'];

//         const res = {
//           "score": citeScore,
//           "url": journal["link"][0]["@href"]
//         };

//         resolve(res);
//       })
//       .catch(error => {
//         console.error('(ArtScore Plugin) - SCOPUS API CALL - Error fetching journal data:', error);
//         reject(error);
//       });
//   });
// }

/**
 * Fetch journal data from the Scopus API using an ISSN.
 *
 * @param {string} journalISSN - Journal ISSN identifier
 * @param {Object} config - Configuration object containing API credentials
 * @param {boolean} [debug=false] - Enable debug logging
 *
 * @returns {Promise<{score: number, url: string}>}
 * Resolves with journal score and URL
 *
 * @throws {Error} If request fails or data is malformed
 */
export async function fetchJournalData(journalISSN, config, debug = false) {
  const apiKey = config?.scopus?.apiKey;

  if (!journalISSN) {
    throw new Error("journalISSN is required");
  }

  const url = `https://api.elsevier.com/content/serial/title/issn/${encodeURIComponent(journalISSN)}?apiKey=${apiKey}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Scopus API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (debug) {
      console.log("SCOPUS RAW RESPONSE:", data);
    }

    const journal = data?.["serial-metadata-response"]?.entry?.[0];

    if (!journal) {
      throw new Error(`No journal data found for ISSN: ${journalISSN}`);
    }

    const citeScore =
      journal?.citeScoreYearInfoList?.citeScoreCurrentMetric;

    const urlLink = journal?.link?.[0]?.["@href"];

    if (!citeScore || !urlLink) {
      throw new Error(`Incomplete journal data for ISSN: ${journalISSN}`);
    }

    return {
      score: citeScore,
      url: urlLink
    };

  } catch (error) {
    if (error.name === "AbortError") {
      console.error("(ArtScore Plugin) - Request timeout");
      throw new Error("Request timed out");
    }

    console.error(
      `(ArtScore Plugin) - SCOPUS API CALL - ISSN: ${journalISSN}`,
      error
    );

    throw error;
  }
}