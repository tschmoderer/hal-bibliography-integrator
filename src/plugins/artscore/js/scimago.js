import { artscore_data } from '../data/scimagojr 2022';

export async function fetchJournalQuartile(journalTitle) {
  if (journalTitle in hal_plugins["artscore"]["scimago"]) {
    journalTitle = hal_plugins["artscore"]["scimago"][journalTitle];
  }

  for (const s in artscore_data) { 
    if (artscore_data[s]["Title"] === journalTitle) {
      if ((typeof halDebug !== "undefined") && (halDebug)) {
        console.log(artscore_data[s]);
      }
      
       return artscore_data[s];
    }
  } 

  throw new Error("Journal not found in scimago");  
}