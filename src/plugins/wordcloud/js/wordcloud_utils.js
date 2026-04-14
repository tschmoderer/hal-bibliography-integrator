export const hbi_wordcloud_plugin_name = "hbi-wordcloud-integrator";

export function validate_hbi_wordcloud_config(hbi_config) {
    // This function validate that the HBI module configuration variable contains the required values for the wordcloud plugin
    // Throw an error if some configuration is incorrect
    // Return True if everything is correct

    if (typeof hbi_config === 'undefined') {
        // si le configuration n'est pas présente on quite immédiatement
        throw new Error("hbi_config is not defined");
    }

    // The worcloud plugin does not require specific configuration yet. 
    // We just set default values

    // If necessary create the plugins entry
    if (typeof hbi_config["plugins"] === 'undefined') {
        hbi_config["plugins"] = {};
    }

    // If necessary add the worcloud plugin
    if (typeof hbi_config["plugins"]["wordcloud"] === 'undefined') {
        hbi_config["plugins"]["wordcloud"] = {};
    }

    // Set default value for the 'doit' key
    if (hbi_config["plugins"]["wordcloud"]["doit"] == 'undefined') {
        hbi_config["plugins"]["wordcloud"]["doit"] = true;
    }

    // Set default value for the 'debug' key
    if (hbi_config["plugins"]["wordcloud"]["debug"] == 'undefined') {
        hbi_config["plugins"]["wordcloud"]["debug"] = false;
    }

    // Display a message if we are in debug mode
    if (hbi_config["plugins"]["wordcloud"]["debug"]) {
        console.log("Info: Debug mode is activated for HBI plugin wordcloud");
    }

    return true;
}