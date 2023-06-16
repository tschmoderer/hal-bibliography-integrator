import create_hal_publication_list from "./hal_publications";
//import create_hal_wordcloud from "./hal_wordcloud"; 
import { globalHalData } from "./hal_utils";
import collapse from "./hal_collapse"; 
import copyCitation from "./hal_citations"; 

document.addEventListener("DOMContentLoaded", () => {
    var debug = true;
    if ((typeof halDebug !== "undefined") && (halDebug)) {
        console.log(idhal);
        console.log(publiList);
    } else {
        debug = false;
    }

    create_hal_publication_list(idhal, publiList, debug);
    console.log(globalHalData); 
});
