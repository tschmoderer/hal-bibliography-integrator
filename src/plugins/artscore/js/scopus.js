export function fetchJournalData(journalISSN, config, debug) {
  return new Promise((resolve, reject) => {
    const apiKey = config["artscore"]["scopus"]["apiKey"]; // Replace with your Scopus API key
    fetch(`https://api.elsevier.com/content/serial/title/issn/${encodeURIComponent(journalISSN)}?apiKey=${apiKey}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Process the fetched data
        if (debug) {
          console.log(data);
        }

        const journal = data['serial-metadata-response'].entry[0];
        const citeScore = journal['citeScoreYearInfoList']['citeScoreCurrentMetric'];

        const res = {
          "score": citeScore, 
          "url": journal["link"][0]["@href"]
        };
        
        resolve(res);
      })
      .catch(error => {
        console.error('(ArtScore Plugin) - SCOPUS API CALL - Error fetching journal data:', error);
        reject(error);
      });
  });
}
