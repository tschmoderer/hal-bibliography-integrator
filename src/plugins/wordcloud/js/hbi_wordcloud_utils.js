export function validate_hbi_wordcloud_config(hbi_config) {
    // This function validate that the configuration variable contains the required value. 
    // Return True if everything is correct
    if (typeof hbi_config === 'undefined') {
        // si le configuration n'est pas présente on quite immédiatement
        return false;
    }

    if (hbi_config["plugins"]["wordcloud"]["doit"] == 'undefined') {
        hbi_config["plugins"]["wordcloud"]["doit"] = true;
    }

    if (!hbi_config["plugins"]["wordcloud"]["doit"]) {
        console.log("Warning: 'doit' defined in hbi_config['plugins']['wordcloud'] is set to 'false'. Nothing will be done");
        return false;
    }

    if (hbi_config["plugins"]["wordcloud"]["debug"] == 'undefined') {
        console.log("Info: Debug mode is deactivated for HBI plugin Wordcloud");
        hbi_config["plugins"]["wordcloud"]["debug"] = false;
    }

    if (("debug" in hbi_config["plugins"]["wordcloud"]) && (hbi_config["plugins"]["wordcloud"]["debug"])) {
        console.log("Info: Debug mode is activated for HBIplugin wordcloud");
    }

    return true;
}