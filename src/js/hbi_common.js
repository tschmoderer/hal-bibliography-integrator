export var globalHBIData = {};


export const hbi_helpers = {
    "THESE": {
        "icon": "fa-graduation-cap",
        "title_en": "Thesis",
        "label_en": "thesis",
    },

    "ART": {
        "icon": "fa-newspaper",
        "title_en": "Journal articles",
        "label_en": "articles",
    },

    "UNDEFINED": {
        "icon": "fa-file-pen",
        "title_en": "Preprint",
        "label_en": "preprints",
    },

    "COMM": {
        "icon": "fa-microphone",
        "title_en": "Communications",
        "label_en": "congress",
    },

    "POSTER": {
        "icon": "fa-image",
        "title_en": "Poster",
        "label_en": "posters",
    },

    "OUV": {
        "icon": "fa-book",
        "title_en": "Book",
        "label_en": "books",
    },

    "COUV": {
        "icon": "fa-book",
        "title_en": "Book Chapters",
        "label_en": "chapters",
    },

    "LECTURE": {
        "icon": "fa-book-open",
        "title_en": "Lectures",
        "label_en": "lectures",
    },

    "PATENT": {
        "icon": "fa-lightbulb",
        "title_en": "Patents",
        "label_en": "patents",
    },

    "SOFTWARE": {
        "icon": "fa-microchip",
        "title_en": "Softwares",
        "label_en": "softwares",
    },

    "PROCEEDINGS": {
        "icon": "fa-file",
        "title_en": "Proceedings",
        "label_en": "proceedings",
    }
};

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