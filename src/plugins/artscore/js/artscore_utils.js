export function validate_hbi_artscore_config(hbi_config) {
    // This function validate that the HBI module configuration variable contains the required values for the artscore plugin
    // Throw an error if some configuration is incorrect
    // Return True if everything is correct

    if (typeof hbi_config === 'undefined') {
        // configuration variable undefined
        throw new Error("hbi_config is not defined");
    }

    // The artscore plugin require specific configuration 
    if (typeof hbi_config["plugins"] === 'undefined') {
        // 'plugins' key in configuration variable is undefined
        throw new Error("'plugins' key in hbi_config is not defined");
    } else if (typeof hbi_config["plugins"]["artscore"] === 'undefined') {
        // 'artscore' key in configuration variable is undefined
        throw new Error("'artscore' key in hbi_config['plugins'] is not defined");
    } else if (typeof hbi_config["plugins"]["artscore"]["scopus"] === 'undefined') {
        // 'artscore' key in configuration variable is undefined
        throw new Error("'scopus' key in hbi_config['plugins']['artscore'] is not defined");
    } else if (typeof hbi_config["plugins"]["artscore"]["scopus"]["apiKey"] === 'undefined') {
        // 'artscore' key in configuration variable is undefined
        throw new Error("'apiKey' key in hbi_config['plugins']['artscore']['scopus'] is not defined");
    }

    // Set default value for the 'doit' key
    if (hbi_config["plugins"]["artscore"]["doit"] == 'undefined') {
        hbi_config["plugins"]["artscore"]["doit"] = true;
    }

    // Set default value for the 'debug' key
    if (hbi_config["plugins"]["artscore"]["debug"] == 'undefined') {
        hbi_config["plugins"]["artscore"]["debug"] = false;
    }

    if (hbi_config["plugins"]["artscore"]["debug"]) {
        console.log("Info: Debug mode is activated for HBI plugin artscore");
    }

    return true;
}