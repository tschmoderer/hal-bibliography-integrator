import '../scss/main.scss'

import create_hal_publication_list from "./hal_publications";

function make_hal(id, pubType, debug) {
    if ((typeof debug !== "undefined") && (debug)) {
        console.log(id);
        console.log(pubType);
    } else {
        var debug = false;
    }

    create_hal_publication_list(id, pubType, debug);
}

if (typeof hal_integrator_config !== 'undefined') {
    if (!("doit" in hal_integrator_config) || (hal_integrator_config["doit"])) {
        document.addEventListener("DOMContentLoaded", make_hal(hal_integrator_config["id"], hal_integrator_config["typeList"], hal_integrator_config["debug"]), false);
    }
}