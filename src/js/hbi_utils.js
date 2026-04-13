export const hbi_module_name = "hbi-bibliography-integrator";

export const hbi_helpers = {
    "THESE": {
        "icon": "fa-graduation-cap",
        "title_en": "Thesis",
    },

    "ART": {
        "icon": "fa-newspaper",
        "title_en": "Journal articles",
    },

    "UNDEFINED": {
        "icon": "fa-file-pen",
        "title_en": "Preprint",
    },

    "COMM": {
        "icon": "fa-microphone",
        "title_en": "Communications",
    },

    "POSTER": {
        "icon": "fa-image",
        "title_en": "Poster",
    },

    "OUV": {
        "icon": "fa-book",
        "title_en": "Book",
    },

    "COUV": {
        "icon": "fa-book",
        "title_en": "Book Chapters",
    },

    "LECTURE": {
        "icon": "fa-book-open",
        "title_en": "Lectures",
    },

    "PATENT": {
        "icon": "fa-lightbulb",
        "title_en": "Patents",
    },

    "SOFTWARE": {
        "icon": "fa-microchip",
        "title_en": "Softwares",
    },

    "PROCEEDINGS": {
        "icon": "fa-file",
        "title_en": "Proceedings",
    }
};

export var globalHbiData = {};

export const eventNameHBIDone = "hbiMainDone";
export const eventNameArtDone = "hbiArticleDone";

export function validate_hbi_config(hbi_config) {
    // This function validate that the configuration variable contains the required value. 
    // Return True if everything is correct

    if (typeof hbi_config == 'undefined') {
        // variable undefined
        console.log("Error: hbi_config is not defined");
        return false;
    } else if (hbi_config["id"] == 'undefined') {
        console.log("Error: No 'id' defined in hbi_config");
        return false;
    } else if (hbi_config["id"] == '') {
        console.log("Error: 'id' defined in hbi_config cannot be empty");
        return false;
    }

    if (hbi_config["doit"] == 'undefined') {
        hbi_config["doit"] = true;
    }

    if (!hbi_config["doit"]) {
        console.log("Warning: 'doit' defined in hbi_config is set to 'false'. Nothing will be done");
        return false;
    }

    if (hbi_config["debug"] == 'undefined') {
        console.log("Info: Debug mode is deactivated for HBI");
        hbi_config["debug"] = false;
    }

    if (("debug" in hbi_config) && (hbi_config["debug"])) {
        console.log("Info: Debug mode is activated for HBI");
    }

    // TODO: Add configuration check for plugins

    return true;
}

export function create_spinner(id = null) {
    const spinner = document.createElement("div");
    spinner.classList = "hbi-spinner";
    if (id) {
        spinner.id = id;
    }

    const ellipsis = document.createElement("div");
    ellipsis.classList.add("lds-ellipsis");
    for (let i = 1; i <= 4; i++) {
        ellipsis.appendChild(document.createElement("div"));
    }

    spinner.appendChild(ellipsis);
    return spinner;
}
