export const hal_module_name = "hal-bibliography-integrator";

export const hal_helpers = {
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
	"POSTER":{
		"icon":"fa-image",
        "title_en": "Poster",
	},
	"OUV":{
		"icon":"fa-book",
        "title_en": "Book",
	},
	"COUV":{
		"icon":"fa-book",
        "title_en": "Book Chapters",
	},
    "LECTURE": {
        "icon": "fa-book-open",
        "title_en": "Lectures",
    },

    "SOFTWARE": {
        "icon": "fa-microchip",
        "title_en": "Softwares",
    }
};

export var globalHalData = {};

export const eventNameHalDone = "halMainDone"; 
export const eventNameArtDone = "halArticleDone"; 