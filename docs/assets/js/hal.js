'use strict';

const hal_api_url = "https://api.archives-ouvertes.fr/search";

async function callHALAPI(parameters, debug = false) {
    try {
        // Definition des paramètres de la recherche
        const param = new URLSearchParams(parameters);
        
        // Instanciation de l'url 
        var url = new URL(hal_api_url);
        url.search = param.toString();

        if (debug) {
            console.dir(url);
        }

        // Appel de l'API
        const response = await fetch(url);
        const data     = await response.json();

        // Return 
        return data.response.docs;
    } catch (error) {
        console.log("Error in call on HAL API on url : " + url.toString());
        console.error(error);
    }
}

const hal_module_name = "hal-bibliography-integrator";

const hal_helpers = {
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

    "PATENT": {
        "icon": "fa-lightbulb",
        "title_en": "Patents",
    },

    "SOFTWARE": {
        "icon": "fa-microchip",
        "title_en": "Softwares",
    },
	"PROCEEDINGS":{
        "icon": "fa-file",
        "title_en": "Proceedings",
	}
};

var globalHalData = {};

const eventNameHalDone = "halMainDone"; 
const eventNameArtDone = "halArticleDone";

function collapse(event) {
    event.preventDefault();
    const elem = event.target.closest("button");
    const elem2 = document.getElementById(elem.getAttribute("data-target").replace('#', ''));
    if (elem2.style.display === "none") {
        elem2.style.display = "block";
        elem.querySelector(".icon-drop_down").classList.remove("fa-rotate-by");
    } else {
        elem2.style.display = "none";
        elem.querySelector(".icon-drop_down").classList.add("fa-rotate-by");
    }
}

// Fonction pour gérer les popups de citations
function copyCitation(idDoc, debug = false) {
    const id = "hal-citation-biblatex-" + idDoc;
    const elem = document.getElementById(id); 

    // Copy the text inside the text field
    navigator.clipboard.writeText(elem.innerText);

    if (debug) {
        console.log("Copy text to clipboard");
        console.log(elem.innerText);
    }

    // Display green message for 3 second
    const success = elem.parentElement.querySelector("[id='hal-copy-success']");
    success.classList.remove('hidden');
    success.classList.add('visible');
  
    setTimeout(function() {
        success.classList.add('hidden');
        success.classList.remove('visible');    
    }, 3000); 
}

function trigger_hal(eventName) {
    const event = new Event(eventName);
    document.dispatchEvent(event);
}

function trigger_hal_article_end() {
    trigger_hal(eventNameArtDone);
}

function trigger_hal_end() {
    trigger_hal(eventNameHalDone);
}

function create_spinner(id = null) {
    const spinner = document.createElement("div");
    spinner.classList = "hal-spinner";
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


function initialHTML(type) {
    const container = document.createElement("div");
    container.classList.add('hal-list');
    container.id = `hal-${type}`;

    const button = document.createElement("button");
    button.id=`hal-btn-${type}`;
    button.classList.add("hal-btn");
    button.setAttribute("data-target", `#${type}`);

    const icon = document.createElement("i");
    icon.classList.add('hal-icon', 'fa-solid', hal_helpers[type]["icon"]);
    button.appendChild(icon);

    const title = document.createElement("a");
    title.id = `hal-${type}-card-title`;
    title.textContent = hal_helpers[type]["title_en"];
    button.appendChild(title);

    const caretIcon = document.createElement("i");
    caretIcon.classList.add('hal-icon', 'icon-drop_down', 'fa-solid', 'fa-caret-down');
    button.appendChild(caretIcon);

    button.addEventListener("click", collapse);

    container.appendChild(button);

    const spinner = create_spinner(`hal-${type}-spinner`);

    container.appendChild(spinner);

    const content = document.createElement("div");
    content.classList.add("hal-content");
    content.id = type;

    const table = document.createElement("table");
    table.classList.add("hal-results-table");

    const tbody = document.createElement("tbody");
    tbody.id = `hal-${type}-table`;

    table.appendChild(tbody);
    content.appendChild(table);
    container.appendChild(content);

    return container;
}

async function genListPubli(id, type, debug = false) {
    const param = {
        q: `authIdHal_s: ${id}`,
		rows: "10000",
        fl: [
            "title_s",
            "halId_s",
            "citationRef_s",
            "defenseDateY_i",
            "journalTitle_s",
            "authFullName_s",
            "publicationDate_tdate",
            "fileMain_s",
            "thumbId_i",
            "label_bibtex",
            "en_keyword_s",
            "journalIssn_s",
            "doiId_s",
        ],
        fq: `docType_s: ${type}`,
        sort: "publicationDate_tdate desc",
        wt: "json",
    };

    return callHALAPI(param).then(data => {
        // Sauvegarde des data dans une variable global pour les plugins 
        globalHalData[type] = data;
        // Set title 
        document.getElementById(`hal-${type}-card-title`).innerText = `${hal_helpers[type]["title_en"]} (${data.length})`;

        // Complete list 
        var tab = document.getElementById(`hal-${type}-table`);
        for (const p of data) {
            if (debug) {
                console.log(p);
            }

            const row = document.createElement("tr");
            row.id = `row-${p.halId_s}`;

            const cell = document.createElement("td");
            cell.classList.add("d-sm-table-cell");

            if (p.thumbId_i) {
                const link = document.createElement("a");
                link.href = p.fileMain_s;
                link.target = "_blank";

                const mediaDiv = document.createElement("div");
                mediaDiv.classList.add("hal-media", "d-sm-block");

                const image = document.createElement("img");
                image.src = `https://thumb.ccsd.cnrs.fr/${p.thumbId_i}/thumb`;
                image.alt = "Image document";

                mediaDiv.appendChild(image);
                link.appendChild(mediaDiv);
                cell.appendChild(link);
            }

            const titleCell = document.createElement("td");
            titleCell.classList.add("hal-title");

            const titleLink = document.createElement("a");
            titleLink.href = `https://hal.science/${p.halId_s}`;
            titleLink.target = "_blank";

            const titleHeading = document.createElement("h3");
            titleHeading.classList.add("title-results");
            titleHeading.textContent = p.title_s[0];

            titleLink.appendChild(titleHeading);
            titleCell.appendChild(titleLink);


            let nbit = p.authFullName_s.length;
            for (const author of p.authFullName_s) {
                const authorLink = document.createElement("a");
                authorLink.href = `https://hal.science/search/?q=*&authFullName_s=${author}`;
                authorLink.alt = "Documents de l auteur";
                authorLink.target = "_blank";
                authorLink.textContent = author;

                titleCell.appendChild(authorLink);

                if (--nbit) {
                    titleCell.appendChild(document.createTextNode(" ; "));
                }
            }

            const citationDiv = document.createElement("div");
            citationDiv.classList.add("citation-results");
            citationDiv.innerHTML = p.citationRef_s;

            titleCell.appendChild(document.createElement("br"));
            titleCell.appendChild(citationDiv);

            const exportDiv = document.createElement("div");
            exportDiv.classList.add("export-result");
            if (p.thumbId_i) {
                const pdfLink = document.createElement("a");
                pdfLink.href = p.fileMain_s;
                pdfLink.target = "_blank";
                pdfLink.classList.add("hal-export-pdf");

                const pdfIcon = document.createElement("i");
                pdfIcon.classList.add("fa-regular", "fa-file-pdf");

                pdfLink.appendChild(pdfIcon);
                exportDiv.appendChild(pdfLink);
            }

            const citeLink = document.createElement("a");
            citeLink.classList.add("hal-export-cite");
            citeLink.addEventListener("click", () => {copyCitation(p.halId_s, debug);});
            citeLink.title = "Copy BibLatex Citation";

            const quoteIcon = document.createElement("i");
            quoteIcon.classList.add("fa-solid", "fa-quote-right");

            const copySuccess = document.createElement("a");
            copySuccess.id = "hal-copy-success";
            copySuccess.classList.add("hal-citation-copy-success", "hidden");
            copySuccess.textContent = "BibLatex citation copied";

            const bibtexCitation = document.createElement("p");
            bibtexCitation.classList.add("hal-biblatex-citation");
            bibtexCitation.id = `hal-citation-biblatex-${p.halId_s}`;
            bibtexCitation.textContent = p.label_bibtex;

            citeLink.appendChild(quoteIcon);
            citeLink.appendChild(copySuccess);
            citeLink.appendChild(bibtexCitation);
            exportDiv.appendChild(citeLink);

            titleCell.appendChild(exportDiv);

            row.appendChild(cell);
            row.appendChild(titleCell);

            tab.appendChild(row);


        };

        // Remove loader
        document.getElementById("hal-" + type + "-spinner").style.display = "none";
        document.getElementById("hal-" + type).style.display = "block";
        if(hal_integrator_config["onLoad"].toLowerCase() === "collapsed"){
            document.getElementById(type).style.display = "none";
            document.getElementById("hal-btn-" + type).querySelector(".icon-drop_down").classList.add("fa-rotate-by");
        }

        // Update mathjax
        MathJax.typeset([document.getElementById(type)]);

        // If article trigger event 
        if (type === "ART") {
            trigger_hal_article_end();
        }
    }).catch(error => console.error(error));
}

function create_hal_publication_list(idhal, pubTypeList, debug = false) {
    // Récupère la div ou placer la liste des publications 
    var hal_publi_div = document.getElementById(hal_module_name);

    // Si elle n'existe pas on ne fait rien 
    if (hal_publi_div === null) {
        if (debug) {
            console.log("No HAL publication div on this page");
        }
        return false;
    }

    if (debug) {
        console.log("Create a list of publications in ");
        console.log(hal_publi_div);
    }

    // Sinon pour chaque type de publication on créé la liste
    var apiCalls = [];
    for (const p of pubTypeList) {
        hal_publi_div.appendChild(initialHTML(p));
        apiCalls.push(genListPubli(idhal, p, debug));
    }

    Promise.all(apiCalls).then(() => {
        trigger_hal_end();
    });

    return true;
};

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
