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
};

async function callHALAPI(type) {
    try {
        const url = "https://api.archives-ouvertes.fr/search/?q=authIdHal_s:" + idhal + "&wt=json"
        const response = await fetch(url + "&fl=title_s,halId_s,citationRef_s,defenseDateY_i,journalTitle_s,authFullName_s ,fileMain_s, thumbId_i&fq=docType_s:" + type);
        const data = await response.json();
        //const publications = data.response.docs;
        return data.response.docs;
    } catch (error) {
        console.error(error);
    }
}

function initialHTML(type) {
    var str = "<div id='hal-" + type + "-main'>" +
        "<div class='hal-list' id='hal-" + type + "'>" +
        "<!--HAL " + type + " BUTTON-->" +
        "<button data-target='#" + type + "' class='hal-btn' onclick='collapse(this)'>" +
        "<i class='hal-icon fa-solid " + hal_helpers[type]["icon"] + "'></i>" +
        "<a id='hal-" + type + "-card-title'>" + hal_helpers[type]["title_en"] + "</a>" +
        "<i class='hal-icon icon-drop_down fa-solid fa-caret-down'></i>" +
        "</button>" +
        "<!--END HAL " + type + " BUTTON-->" +
        "<div class='hal-spinner' id='hal-" + type + "-spinner'>" +
        "<div class='lds-ellipsis'>" +
        "<div></div><div></div><div></div><div></div>" +
        "</div>" +
        "</div>" +
        "<!--HAL " + type + " CONTENT-->" +
        "<div class='hal-content' id='" + type + "'>" +
        "<table class='hal-results-table hal-table-white'>" +
        "<tbody id='hal-" + type + "-table'>" + "</tbody>" +
        "</table>" + " </div>" + "</div>" +
        "<!--HAL " + type + " CONTENT-->" +
        "</div>" +
        "</div>";
    return str;
}

function genListPubli(type) {
    callHALAPI(type).then(data => {
        // Set title 
        document.getElementById("hal-" + type + "-card-title").innerText = hal_helpers[type]["title_en"] + " (" + data.length + ")";

        // Complete list 
        var tab = document.getElementById("hal-" + type + "-table");
        for (const p of data) {
            console.log(p);
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
                "</div>" +
                "</td>" +
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

document.addEventListener("DOMContentLoaded", () => {
    console.log(idhal);
    console.log(publiList);

    const hal_div = document.getElementById("publi-hal-all");

    if (hal_div.length === 0) {
        console.log("No Hal on this page");
        return 0;
    }

    for (const p of publiList) {
        // console.log("Add initial html for " + p);
        // initialisation 
        hal_div.innerHTML += initialHTML(p);

        // generate publi list 
        genListPubli(p);
    }
});

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