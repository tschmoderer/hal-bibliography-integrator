import '../scss/main.scss'

import { create_hal_publication_list } from "./hbi_publications";
import { hbi_module_name, validate_hbi_config } from "./hbi_utils";

/**
 * Render HAL publications inside the target DOM element.
 * 
 * @param {string} id - HAL identifier
 * @param {string|Array} pubType - Publication types
 * @param {string} onLoad - Section behavior when created (collapsed or expanded)
 * @param {boolean} debug - Enable debug mode
 */
function hbi_make(id, pubType, onLoad, debug) {
    // Locate the <div> container to display the HBI results
    var hbi_div = document.getElementById(hbi_module_name);

    // If not exists do nothing
    if (!hbi_div) {
        throw new Error("HBI: No HAL publication div found on this page");
    }

    if (debug) {
        console.log("HBI DEBUG: Target container");
        console.log(hbi_div);
    }

    create_hal_publication_list(id, pubType, hbi_div, onLoad, debug)
}

/**
 * Initialize the HBI module.
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.id - HAL identifier
 * @param {string|Array} config.typeList - Publication types
 * @param {boolean} config.debug - Enable debug logs
 * @param {boolean} config.doit - Whether to execute
 * 
 * @returns {number|void}
 */
export function hbi_start(hbi_config) {
    try {
        validate_hbi_config(hbi_config)
    } catch (err) {
        console.error("HBI CONFIG ERROR:", err);
        return -1;
    }

    const debug = hbi_config["debug"];

    if (!hbi_config["doit"]) {
        if (debug) {
            console.warn("HBI: Execution skipped because 'doit' is false.");
        }
        return 0;
    }

    // Display config
    if (debug) {
        console.log("HBI INFO: config");
        console.log(hbi_config);
    }

    // Start HBI when DOM is loaded
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            hbi_make(
                hbi_config["id"],        // id HAL
                hbi_config["typeList"],  // List of document types
                hbi_config["onLoad"],    // Behavior
                debug)                   // debug mode
        );
    } else {
        // DOM already loaded
        hbi_make(
            hbi_config["id"],        // id HAL
            hbi_config["typeList"],  // List of document types
            hbi_config["onLoad"],    // Behavior
            debug)                   // debug mode
    }
}