import '../scss/main.scss'

import create_hal_publication_list from "./hal_publications";
//import create_hal_wordcloud from "./hal_wordcloud"; 
import { globalHalData, totalNbAPIcall } from "./hal_utils";
import collapse from "./hal_collapse"; 
import copyCitation from "./hal_citations"; 

function trigger_hal_end(debug) {
    if (Object.keys(globalHalData).length === totalNbAPIcall) {
        if (debug) {
            console.log(globalHalData); 
        }
        const event = new Event("halMainDone");
        document.dispatchEvent(event);
    } else {
        setTimeout(trigger_hal_end, 100, debug)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    var debug = true;
    if ((typeof halDebug !== "undefined") && (halDebug)) {
        console.log(idhal);
        console.log(publiList);
    } else {
        debug = false;
    }

    create_hal_publication_list(idhal, publiList, debug);
    trigger_hal_end(debug);
});