export var hbi_charts_plugin_name = "hbi-charts-integrator";

export var HBI_CHARTS_SHOW_OPTIONS = [
    { key: "metrics", label: "Indicateurs bibliométriques" },
    { key: "thematiques", label: "Thématiques scientifiques" },
    { key: "domaines", label: "Domaines d'application" },
    { key: "citations", label: "Citations par année" },
];

export function validate_hbi_charts_config(hbi_config) {
    // This function validate that the HBI module configuration variable contains the required values for the charts plugin
    // Throw an error if some configuration is incorrect
    // Return True if everything is correct

    if (typeof hbi_config === 'undefined') {
        // configuration variable undefined
        throw new Error("hbi_config is not defined");
    }

    // The charts plugin require specific configuration 
    if (typeof hbi_config["plugins"] === 'undefined') {
        // 'plugins' key in configuration variable is undefined
        throw new Error("'plugins' key in hbi_config is not defined");
    } else if (typeof hbi_config["plugins"]["charts"] === 'undefined') {
        // 'charts' key in configuration variable is undefined
        throw new Error("'charts' key in hbi_config['plugins'] is not defined");
    }

    // Set default value for the 'doit' key
    if (hbi_config["plugins"]["charts"]["doit"] == 'undefined') {
        hbi_config["plugins"]["charts"]["doit"] = true;
    }

    // Set default value for the 'debug' key
    if (hbi_config["plugins"]["charts"]["debug"] == 'undefined') {
        hbi_config["plugins"]["charts"]["debug"] = false;
    }

    if (hbi_config["plugins"]["charts"]["debug"]) {
        console.log("Info: Debug mode is activated for HBI plugin charts");
    }

    // Set default value for the 'maxCategories' key
    if (typeof hbi_config["plugins"]["charts"]["maxCategories"] === 'undefined') {
        hbi_config["plugins"]["charts"]["maxCategories"] = 8;
    }

    // Set default value for the 'renameThematiques' key
    if (typeof hbi_config["plugins"]["charts"]["renameThematiques"] === 'undefined') {
        hbi_config["plugins"]["charts"]["renameThematiques"] = {};
    }

    // Set default value for the 'renameDomaines' key
    if (typeof hbi_config["plugins"]["charts"]["renameDomaines"] === 'undefined') {
        hbi_config["plugins"]["charts"]["renameDomaines"] = {};
    }

    // Set default value for the 'show' key
    if (typeof hbi_config["plugins"]["charts"]["show"] === 'undefined') {
        hbi_config["plugins"]["charts"]["show"] = HBI_CHARTS_SHOW_OPTIONS.map(o => o.key);
    }

    return true;
}

export function hbi_plugin_charts_show_message(container, msg, className = "hbi-charts-error") {
    container.innerHTML = `<div class=${className}>HBI Charts Plugin: ${msg}</div>`;
}

export function hbi_plugin_charts_create_cards(id, title, extraClass = "") {
    const card = document.createElement("div");
    card.className = `hbi-charts-card ${extraClass}`.trim();

    const titleEl = document.createElement("div");
    titleEl.className = "hbi-charts-card-title";
    titleEl.textContent = title;

    const canvasWrapper = document.createElement("div");
    canvasWrapper.className = "hbi-charts-canvas-wrapper";

    const canvas = document.createElement("canvas");
    canvas.id = id;

    canvasWrapper.appendChild(canvas);

    const legend = document.createElement("div");
    legend.className = "hbi-charts-legend";
    legend.id = `${id}-legend`;

    card.appendChild(titleEl);
    card.appendChild(canvasWrapper);
    card.appendChild(legend);

    return card;
}