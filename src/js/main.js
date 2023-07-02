import '../scss/main.scss'

import create_hal_publication_list from "./hal_publications";
import collapse from "./hal_collapse";
import copyCitation from "./hal_citations";

function make_hal(id, pubType, debug) {
    var debug = true;
    if ((typeof halDebug !== "undefined") && (halDebug)) {
        console.log(id);
        console.log(pubType);
    } else {
        debug = false;
    }

    create_hal_publication_list(id, pubType, debug);
}

document.addEventListener("DOMContentLoaded", make_hal(idhal, publiList, halDebug), false);