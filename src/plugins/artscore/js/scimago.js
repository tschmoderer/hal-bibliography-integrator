import { artscore_data } from '../data/scimagojr 2022';

export async function fetchJournalQuartile(journalTitle, config, debug) {
  console.log(config["artscore"]);
  if (config["artscore"]["scimago"] !== undefined) {
    if (journalTitle in config["artscore"]["scimago"]) {
      journalTitle = config["artscore"]["scimago"][journalTitle];
    }
  }

  for (const s in artscore_data) {
    if (artscore_data[s]["Title"] === journalTitle) {
      if (debug) {
        console.log(artscore_data[s]);
      }

      return artscore_data[s];
    }
  }

  throw new Error("Journal not found in scimago");
}