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

    "LECTURE": {
        "icon": "fa-book-open",
        "title_en": "Lectures",
    },

    "SOFTWARE": {
        "icon": "fa-microchip",
        "title_en": "Softwares",
    }
};

var globalHalData = {};

const eventNameHalDone = "halMainDone"; 
const eventNameArtDone = "halArticleDone";

function trigger_hal(eventName) {
    const event = new Event(eventName);
    document.dispatchEvent(event);
}

function trigger_hal_article_end() {
    trigger_hal(eventNameArtDone);
}

function trigger_hal_end() {
    trigger_hal(eventNameHalDone);
    /*if (Object.keys(globalHalData).length === totalNbAPIcall) {
        if (debug) {
            console.log(globalHalData);
        }
        const event = new Event("halMainDone");
        document.dispatchEvent(event);
    } else {
        setTimeout(trigger_hal_end, 100, debug)
    }*/
//    const event = new Event("halMainDone");
//    document.dispatchEvent(event);
}

function create_spinner(id = null) {
    var spinner = document.createElement("div");
    spinner.classList = "hal-spinner";
    spinner.id = id;

    var ellipsis = document.createElement("div");
    ellipsis.classList = "lds-ellipsis"; 
    for (let i = 1; i <= 4; i++) {
        ellipsis.appendChild(document.createElement("div"));
    }

    spinner.appendChild(ellipsis); 

    return spinner;
}

function initialHTML(type) {
    var container = document.createElement("div");
    container.classList = 'hal-list';
    container.id = "hal-" + type;

    var button = document.createElement("button");
    button.classList = "hal-btn";
    button.setAttribute("data-target", "#" + type);
    button.setAttribute("onclick", "collapse(this)");

    button.innerHTML = "<i class='hal-icon fa-solid " + hal_helpers[type]["icon"] + "'></i>"; 
    button.innerHTML += "<a id='hal-" + type + "-card-title'>" + hal_helpers[type]["title_en"] + "</a>";
    button.innerHTML += "<i class='hal-icon icon-drop_down fa-solid fa-caret-down'></i>";

    container.appendChild(button);

    var spinner = create_spinner( "hal-" + type + "-spinner");

    container.appendChild(spinner);

    var content = document.createElement("div"); 
    content.classList = "hal-content"; 
    content.id = type; 
    content.innerHTML = "<table class='hal-results-table'><tbody id='hal-" + type + "-table'>" + "</tbody></table>";

    container.append(content);

    return container;
}

function genListPubli(id, type) {
    const param = {
        q: "authIdHal_s:" + id, 
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
        fq: "docType_s:" + type,
        sort: "publicationDate_tdate desc", 
        wt: "json",
    };

    return callHALAPI(param).then(data => {
        // Sauvegarde des data dans une variable global pour les plugins 
        globalHalData[type] = data;
        // Set title 
        document.getElementById("hal-" + type + "-card-title").innerText = hal_helpers[type]["title_en"] + " (" + data.length + ")";

        // Complete list 
        var tab = document.getElementById("hal-" + type + "-table");
        for (const p of data) {
            if ((typeof halDebug !== "undefined") && (halDebug)) {
                console.log(p);
            }
            var str = "";
            str = str + "<tr id='row-" + p.halId_s + "'>";
            if (p.thumbId_i) {
                str += "<td class='d-sm-table-cell'>" +
                    "<a href=" + p.fileMain_s + ">" +
                    "<div class='hal-media d-sm-block'>" +
                    "<img src='https://thumb.ccsd.cnrs.fr/" + p.thumbId_i + "/thumb' alt='Image document'>" +
                    "</div>" +
                    "</a>" +
                    "</td>";
            } else {
                str += "<td class='d-sm-table-cell'></td>";
            }
            // removed style='width: 100%'  from the style below
            str += "<td class='hal-title'>" +
                "<a href='https://hal.science/" + p.halId_s + "' target='_blank'>" +
                "<h3 class='title-results'>" +
                p.title_s[0] +
                "</h3>";

            let nbit = p.authFullName_s.length;
            for (const a of p.authFullName_s) {
                str = str +
                    "<a href='https://hal.science/search/?q=*&authFullName_s=" +
                    a + "' alt='Documents de l auteur' target='_blank'>" +
                    a + "</a>";
                if (--nbit) {
                    str = str + " ; ";
                };
            };

            str = str + "</a>";
            str = str + "<br>";
            str = str +
                "<div class='citation-results'>" +
                p.citationRef_s +
                "</div>";
            str = str +
                "<div class='export-result'>";
            if (p.thumbId_i) {
                str = str + "<a href='" + p.fileMain_s  + "' target='_blank' class='hal-export-pdf'><i class='fa-regular fa-file-pdf'></i></a>";
            }   
            str = str + "<a class='hal-export-cite' onclick='copyCitation(\"" + p.halId_s + "\")' title='Copy BibLatex Citation'><i class='fa-solid fa-quote-right'></i><a id='hal-copy-success' class='hal-citation-copy-success hidden'>BibLatex citation copied</a>" +
            "<p class='hal-biblatex-citation' id='hal-citation-biblatex-"+ p.halId_s +"'>"+ p.label_bibtex+ "</p></a>" + 
                "</div>";
            str = str + "</td>" +
                " </tr>";
            tab.innerHTML += str;
        };

        // Remove loader
        document.getElementById("hal-" + type + "-spinner").style.display = "none";
        document.getElementById("hal-" + type).style.display = "block";

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
    var hal_publi_div = document.getElementById("publi-hal-all");

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
        apiCalls.push(genListPubli(idhal, p));
    }

    Promise.all(apiCalls).then(() => {
        trigger_hal_end();
    });

    return true;
};

function collapse(elem) {
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
function copyCitation(idDoc) {
    const id = "hal-citation-biblatex-" + idDoc;
    const elem = document.getElementById(id); 

    // Copy the text inside the text field
    navigator.clipboard.writeText(elem.innerText);

    if ((typeof halDebug !== "undefined") && (halDebug)) {
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

function make_hal(id, pubType, debug) {
    var debug = true;
    if ((typeof halDebug !== "undefined") && (halDebug)) {
        console.log(id);
        console.log(pubType);
    } else {
        debug = false;
    }

    create_hal_publication_list(id, pubType, debug);
}

document.addEventListener("DOMContentLoaded", make_hal(idhal, publiList, halDebug), false);
