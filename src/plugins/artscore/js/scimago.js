import artscore_data from '../data/scimagojr.json' assert { type: 'json' };

/*
Lookup data in the scimago database for a scientific journal 
*/
export async function fetchJournalQuartile(journalTitle, config, debug) {
  if (config["scimago"] !== undefined) {
    // Update journal title if it mismatched the name in the scimago database 
    if (journalTitle in config["scimago"]) {
      journalTitle = config["scimago"][journalTitle];
    }
  }

  for (const s in artscore_data) {
    if (artscore_data[s]["Title"] === journalTitle) {
      if (debug) {
        console.log("HBI ARTSCORE PLUGIN: scimago match:", artscore_data[s]);
      }
      return artscore_data[s];
    }
  }

  throw new Error(`Journal: ${journalTitle} not found in scimago`);
}