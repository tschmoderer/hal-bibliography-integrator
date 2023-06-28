import '../scss/main.scss';

import { make_artscore_container } from './builder';
import { fetchJournalData } from './scopus';
import { get_artdata } from './getData';
import { display_artscore } from './displayData';

function add_artscore(data) {
  // On récupère la ligne du tableau qui contient les données à annoter
  var row = document.getElementById("row-" + data["halId_s"]);
  if ((typeof halDebug !== "undefined") && (halDebug)) {
    console.log(row);
  }

  // On récupère les données à afficher 
  //var artData = get_artdata(data); 
  get_artdata(data).then(artData => {
    // On affiche les données 
    display_artscore(row, artData);
  }).catch(error => {
    console.log(error);
  })
}

function HALartscore() {
  // On récupère les infos des articles 
  var data = globalHalData["ART"];
  // TODO: parallel loop
  for (const d in data) {
    if ((typeof halDebug !== "undefined") && (halDebug)) {
      console.log(data[d]);
    }

    add_artscore(data[d]);
  }
}

/* 
  Quand l'évenement HalMainDone est envoyé, on éclenche la création des infos du plugin 
*/
document.addEventListener("halMainDone", () => {
  if ((typeof halDebug !== "undefined") && (halDebug)) {
    console.log("Create ArtScore data");
  }

  HALartscore();
});