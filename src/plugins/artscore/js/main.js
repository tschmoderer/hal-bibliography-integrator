import '../scss/main.scss';

import { get_artdata } from './getData';
import { display_artscore } from './displayData';

function add_artscore(data, config, debug = false) {
  // On récupère la ligne du tableau qui contient les données à annoter
  var row = document.getElementById(`row-${data["halId_s"]}`);
  if (debug) {
    console.log(row);
  }

  // On récupère les données à afficher 
  //var artData = get_artdata(data); 
  get_artdata(data, config, debug).then(artData => {
    // On affiche les données 
    display_artscore(row, artData, debug );
  }).catch(error => {
    console.log(error);
  })
}

function HALartscore(config, debug = false) {
  // On récupère les infos des articles 
  var data = globalHalData["ART"];
  // TODO: parallel loop
  for (const d in data) {
    if (debug) {
      console.log(data[d]);
    }

    add_artscore(data[d], config, debug);
  }
}

/* 
  Quand l'évenement halArticleDone est envoyé, on éclenche la création des infos du plugin 
*/
document.addEventListener("halArticleDone", () => {
  var debug = hal_integrator_config["debug"];
  if (typeof debug === "undefined") {
      debug = false;
  }
  

  if (debug) {
    console.log("Create ArtScore data");
  }

  var hal_plugins = hal_integrator_config["plugins"];

  // on déclenche le plugin si : 
  // la clé "doit" n'est pas définie dans la variable de config 
  // la clé "doit" est définie sur true
  if (!("artscore" in hal_plugins) || !("doit" in hal_plugins["artscore"]) || (hal_plugins["artscore"]["doit"])) {
    HALartscore(hal_plugins, debug);
  }
});