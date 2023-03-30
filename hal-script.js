// Point d'entrée de l'API
const hal_api_url = "https://api.archives-ouvertes.fr/search";
const hal_api_default_param = {
    q: "authIdHal_s:" + idhal, 
    wt: "json",
};

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

async function callHALAPI(parameters) {
    try {
        // Construction des paramètres de la recherche
        const param = new URLSearchParams(parameters);
        for (const [key, value] of Object.entries(hal_api_default_param)) {
            param.append(key, value);
        }
        
        // Instanciation de l'url 
        var url = new URL(hal_api_url);
        url.search = param.toString();
        if ((typeof halDebug !== "undefined") && (halDebug)) {
            console.dir(url);
        }

        // Appel de l'api
        const response = await fetch(url);
        const data     = await response.json();
        return data.response.docs;

    } catch (error) {
        console.log("Error in call HAL API on url : " + url.toString())
        console.error(error);
    }
}

function HALwordcloud(hal_wordcloud_div) {
    const param = {
        fl: "en_keyword_s",
    };

    callHALAPI(param).then(data => {

        var wordcloud_container = document.createElement("div");
        wordcloud_container.classList = "hal-cloud-word";

        if ((typeof halDebug !== "undefined") && (halDebug)) {
            console.log(data);
        }

        // Extract the English keywords from the publications
        const keywords = data.flatMap(doc => doc.en_keyword_s).filter(keyword => keyword !== undefined && keyword !== null && keyword !== "");
        
        // Create a word frequency object
        const wordFreq = {};
        keywords.forEach(k => wordFreq[k] ? wordFreq[k]++ : wordFreq[k] = 1 );

        // Map keyword freq in range 1 to 10
        var max   = Object.entries(wordFreq).reduce((a, b) => a[1] > b[1] ? a : b)[1]
        var min   = Object.entries(wordFreq).reduce((a, b) => a[1] < b[1] ? a : b)[1]

        // Shuffle wordlist
        var len    = Object.keys(wordFreq).length;
        var suffle = Array.from(Array(len).keys())
        suffle.sort(function(a, b){return 0.5 - Math.random()});

        // Create word Cloud
        for (let i = 0; i < len; i++) {
            var word = Object.keys(wordFreq)[suffle[i]];
            var freq = Object.values(wordFreq)[suffle[i]];
            var new_freq = (9*freq+max-10*min)/(max-min);
            wordcloud_container.appendChild(keywordElement(word, new_freq));
        };

        hal_wordcloud_div.appendChild(wordcloud_container);
    });
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

function keywordElement(keyw, freq) {
    var container = document.createElement("a"); 
    container.classList = "keyword keyword-" + freq;
    container.setAttribute("href", "https://hal.science/search/?q=*&authIdHal_s=" + idhal + "&keyword_s=" + keyw);
    container.setAttribute("target","_blank")
    container.innerText = keyw; 
    return container;
}

function genListPubli(type) {
    const param = {
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
        ],
        fq: "docType_s:" + type,
        sort: "publicationDate_tdate desc", 
    }
    callHALAPI(param).then(data => {
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
            str += "<td style='width: 100%' class='hal-title'>" +
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

function create_hal_publication_list() {
    // Récupère la div ou placer la liste des publications 
    var hal_publi_div = document.getElementById("publi-hal-all");

    // Si elle n'existe pas on ne fait rien 
    if (hal_publi_div.length === 0) {
        if ((typeof halDebug !== "undefined") && (halDebug)) {
            console.log("No HAL publication div on this page");
        }
        return 0;
    } else {
        if ((typeof halDebug !== "undefined") && (halDebug)) {
            console.log("Create a list of publications in ");
            console.log(hal_publi_div);
        }
    }

    // Sinon pour chaque type de publication on créé la liste
    for (const p of publiList) {
        hal_publi_div.appendChild(initialHTML(p));
        genListPubli(p);
    }
}; 


function create_hal_wordcloud() {
    // Récupède la div ou placer le nuage de mots
    var hal_wordcloud_div = document.getElementById("wordcloud-hal");

    // Si elle n'existe pas on ne fait rien 
    if (hal_wordcloud_div.length === 0) {
        if ((typeof halDebug !== "undefined") && (halDebug)) {
            console.log("No HAL wordcloud div on this page");
        }
        return 0;
    } else {
        if ((typeof halDebug !== "undefined") && (halDebug)) {
            console.log("Create wordcloud of keywords in ");
            console.log(hal_wordcloud_div);
        }
    }

    // Sinon on créé le nuage de mot
    HALwordcloud(hal_wordcloud_div);
}

document.addEventListener("DOMContentLoaded", () => {
    if ((typeof halDebug !== "undefined") && (halDebug)) {
        console.log(idhal);
        console.log(publiList);
    }

    create_hal_publication_list(); 
    create_hal_wordcloud();
});

// Fonction pour collapser les sections de publications en cliquant sur leur titre
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
        console.log("Copy text to clipboard")
        console.log(elem.innerText);
    }

    // Display green message for 3 second
    const success = elem.parentElement.querySelector("[id='hal-copy-success']");
    success.classList.remove('hidden')
    success.classList.add('visible');
  
    setTimeout(function() {
        success.classList.add('hidden')
        success.classList.remove('visible');    
    }, 3000); 
}
