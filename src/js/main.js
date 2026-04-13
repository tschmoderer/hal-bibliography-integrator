import '../scss/main.scss'

import { create_hal_publication_list } from "./hal_publications";
import { hbi_module_name, validate_hbi_config } from "./hal_utils";

function hbi_make(id, pubType, debug) {
    // Locate <div> where to put the HBI results
    var hbi_div = document.getElementById(hbi_module_name);
    // Si elle n'existe pas on ne fait rien 
    if (hbi_div === null) {
        if (debug) {
            console.log("ERROR HBI: No HAL publication div on this page");
        }
        return;
    }

    if (debug) {
        console.log(`HBI DEBUG: hbi <div>`);
        console.log(hbi_div);
    }

    create_hal_publication_list(id, pubType, hbi_div, debug)
}

export function hbi_start(hbi_config) {
    if (validate_hbi_config(hbi_config)) {
        // Display config
        if (hbi_config["debug"]) {
            console.log("HBI INFO: config");
            console.log(hbi_config);
        }

        // Start HBI when DOM is loaded
        document.addEventListener(
            "DOMContentLoaded",
            hbi_make(
                hal_integrator_config["id"],        // id HAL
                hal_integrator_config["typeList"],  // List of document types
                hal_integrator_config["debug"])     // debug mode
        );
    }
}