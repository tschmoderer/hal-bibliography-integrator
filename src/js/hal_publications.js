import callHALAPI from "./hal_api";
import hal_helpers from "./hal_utils";
import { globalHalData } from "./hal_utils";

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

    var spinner = document.createElement("div");
    spinner.classList = "hal-spinner";
    spinner.id = "hal-" + type + "-spinner";

    var ellipsis = document.createElement("div");
    ellipsis.classList = "lds-ellipsis"; 
    for (let i = 1; i <= 4; i++) {
        ellipsis.appendChild(document.createElement("div"));
    }

    spinner.appendChild(ellipsis); 
    container.appendChild(spinner);

    var content = document.createElement("div"); 
    content.classList = "hal-content"; 
    content.id = type; 
    content.innerHTML = "<table class='hal-results-table hal-table-white'><tbody id='hal-" + type + "-table'>" + "</tbody></table>";

    container.append(content);

    return container;
}

function genListPubli(type) {
    const param = {
        q: "authIdHal_s:" + idhal, 
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
        ],
        fq: "docType_s:" + type,
        sort: "publicationDate_tdate desc", 
        wt: "json",
    }

    callHALAPI(param).then(data => {
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
            var str = ""
            str = str + "<tr>";
            if (p.thumbId_i) {
                str += "<td class='d-sm-table-cell'>" +
                    "<a href=" + p.fileMain_s + ">" +
                    "<div class='hal-media d-sm-block'>" +
                    "<img src='https://thumb.ccsd.cnrs.fr/" + p.thumbId_i + "/thumb' alt='Image document'>" +
                    "</div>" +
                    "</a>" +
                    "</td>";
            } else {
                str += "<td class='d-sm-table-cell'></td>"
            }
            // removed style='width: 100%'  from the style below
            str += "<td class='hal-title' id='row-" + p.halId_s + "'>" +
                "<a href='https://hal.science/" + p.halId_s + "' target='_blank'>" +
                "<h3 class='title-results'>" +
                p.title_s[0] +
                "</h3>" +
                "<span class='authors-results'>";

            let nbit = p.authFullName_s.length;
            for (const a of p.authFullName_s) {
                str = str +
                    "<a href='https://hal.science/search/?q=*&authFullName_s=" +
                    a + "' alt='Documents de l\'auteur' target='_blank'>" +
                    a + "</a>";
                if (--nbit) {
                    str = str + " ; ";
                };
            };

            str = str + "</span>" +
                "</a>";
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
    }).catch(error => console.error(error));
}

export default function create_hal_publication_list(idhal, pubTypeList, debug = false) {
    // Récupère la div ou placer la liste des publications 
    var hal_publi_div = document.getElementById("publi-hal-all");

    // Si elle n'existe pas on ne fait rien 
    if (hal_publi_div === null) {
        if (debug) {
            console.log("No HAL publication div on this page");
        }
        return 0;
    } 

    if (debug) {
        console.log("Create a list of publications in ");
        console.log(hal_publi_div);
    }
    
    // Sinon pour chaque type de publication on créé la liste
    for (const p of pubTypeList) {
        hal_publi_div.appendChild(initialHTML(p));
        genListPubli(p);
    }
}; 