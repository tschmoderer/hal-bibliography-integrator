import '../scss/main.scss';

import { get_artdata } from './getData';
import { display_artscore } from './displayData';
import { validate_hbi_artscore_config } from './artscore_utils';
import { globalHBIData } from '../../../js/hbi_utils';

function add_artscore(data, config, debug = false) {
  // On récupère la ligne du tableau qui contient les données à annoter
  var row = document.getElementById(`row-${data["halId_s"]}`);
  if (debug) {
    console.log("INFO HBI ARTSCORE: <row> to be modified")
    console.log(row);
  }

  // On récupère les données à afficher 
  get_artdata(data, config, debug).then(artData => {
    // On affiche les données 
    display_artscore(row, artData, debug);
  }).catch(error => {
    console.error("ERROR HBI ARTSCORE: Not able to get article details", error)
  })
}

function HALartscore(config, debug = false) {
  // On récupère les infos des articles 
  var data = globalHBIData["ART"];

  // TODO: parallel loop
  for (const d in data) {
    if (debug) {
      console.log("INFO HBI ARTSCORE: Article data to be treated:")
      console.log(data[d]);
    }

    add_artscore(data[d], config, debug);
  }
}

export function hbi_plugin_artscore_start(hbi_config) {
  try {
    validate_hbi_artscore_config(hbi_config)
  } catch (err) {
    console.error("HBI ARTSCORE PLUGIN CONFIG ERROR:", err);
    return -1;
  }

  const debug = hbi_config["plugins"]["artscore"]["debug"];

  if (!hbi_config["plugins"]["artscore"]["doit"]) {
    if (debug) {
      console.warn("HBI: Artscore plugin execution skipped because 'doit' is false.");
    }
    return 0;
  }

  // Display config
  if (debug) {
    console.log("HBI ARTSCORE PLUGIN INFO: config");
    console.log(hbi_config["plugins"]["artscore"]);
  }

  // Quand l’événement hbiArticleDone est envoyé, on déclenche la création des infos du plugin 
  document.addEventListener("hbiArticleDone", () => {
    HALartscore(hbi_config["plugins"]["artscore"], debug);
  });
}