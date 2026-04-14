export const hbi_module_name = "hal-bibliography-integrator";

export const eventNameHBIDone = "hbiMainDone";
export const eventNameArtDone = "hbiArticleDone";

function trigger_hbi_event(eventName) {
    const event = new Event(eventName);
    document.dispatchEvent(event);
}

export function trigger_hbi_event_article_end() {
    trigger_hbi_event(eventNameArtDone);
}

export function trigger_hbi_event_end() {
    trigger_hbi_event(eventNameHBIDone);
}


export function validate_hbi_config(hbi_config) {
    // This function validate that the HBI module configuration variable contains the required values
    // Throw an error if some configuration is incorrect 
    // Return True if everything is correct

    if (typeof hbi_config == 'undefined') {
        // configuration variable undefined
        throw new Error("hbi_config is not defined");
    } else if (typeof hbi_config["id"] == 'undefined') {
        // configuration variable does not contain an id key 
        throw new Error("No 'id' defined in hbi_config");
    } else if (hbi_config["id"] == '') {
        // id key in configuration variable is empty
        throw new Error("'id' defined in hbi_config cannot be empty");
    } else if (typeof hbi_config["typeList"] == 'undefined') {
        // configuration variable does not contain a typeList key
        throw new Error("'typeList' key is not defined in hbi_config");
    }

    // Set default value for the 'doit' key
    if (typeof hbi_config["doit"] == 'undefined') {
        hbi_config["doit"] = true;
    }

    // Set default value for the 'debug' key
    if (typeof hbi_config["debug"] == 'undefined') {
        hbi_config["debug"] = false;
    }

    // Display a message if we are in debug mode
    if (hbi_config["debug"]) {
        console.log("HBI CONFIG INFO: Debug mode is activated for HBI");
    }

    // Set default value for the 'onLoad' key 
    if (typeof hbi_config["onLoad"] == 'undefined') {
        hbi_config["onLoad"] = 'expended'; // or collapsed
        if (hbi_config["debug"]) {
            console.log("HBI CONFIG INFO: 'onLoad' key undefined, default behavior is set to expended")
        }
    } else if ((hbi_config["onLoad"] !== 'expended') && (hbi_config["onLoad"] !== 'collapsed')) {
        hbi_config["onLoad"] = 'expended';
        if (hbi_config["debug"]) {
            console.log("HBI CONFIG INFO: 'onLoad' key undefined, default behavior is set to expended")
        }
    }

    return true;
}