
/*
Q1  | Citations
hindex | CiteScore | SJR 
*/
const ids = [
    'artscoreContainer',
    'artscoreRow1',
    'artscoreQuartile',
    'artscoreCitations',
    'artscoreRow2',
    'artscoreHIndexLegend',
    'artscoreHIndexItem',
    'artscoreCiteScoreLegend',
    'artscoreCiteScoreItem',
    'artscoreSJRLegend',
    'artscoreSJRItem'
];

function base_structure() {
    // Create the main container div
    const artscoreContainer = document.createElement('td');
    const artscoreContainerId = 'artscoreContainer';
    artscoreContainer.id = artscoreContainerId;
    artscoreContainer.classList.add('artscore-container');

    // Create the first row div
    const artscoreRow1 = document.createElement('div');
    const artscoreRow1Id = 'artscoreRow1';
    artscoreRow1.id = artscoreRow1Id;
    artscoreRow1.classList.add('artscore-row-1');

    // Create the quartile div
    const artscoreQuartile = document.createElement('div');
    const artscoreQuartileId = 'artscoreQuartile';
    artscoreQuartile.id = artscoreQuartileId;
    artscoreQuartile.classList.add('artscore-quartile');
    artscoreRow1.appendChild(artscoreQuartile);

    // Create the citations div
    const artscoreCitations = document.createElement('div');
    const artscoreCitationsId = 'artscoreCitations';
    artscoreCitations.id = artscoreCitationsId;
    artscoreCitations.classList.add('artscore-citations');
    artscoreRow1.appendChild(artscoreCitations);

    // Append the first row to the container
    artscoreContainer.appendChild(artscoreRow1);

    // Create the second row div
    const artscoreRow2 = document.createElement('div');
    const artscoreRow2Id = 'artscoreRow2';
    artscoreRow2.id = artscoreRow2Id;
    artscoreRow2.classList.add('artscore-row-2');

    // Create the h-index legend div
    const artscoreHIndexLegend = document.createElement('div');
    const artscoreHIndexLegendId = 'artscoreHIndexLegend';
    artscoreHIndexLegend.id = artscoreHIndexLegendId;
    artscoreHIndexLegend.classList.add('artscore-hindex-legend', 'artscore-legend');
    artscoreRow2.appendChild(artscoreHIndexLegend);

    // Create the h-index item div
    const artscoreHIndexItem = document.createElement('div');
    const artscoreHIndexItemId = 'artscoreHIndexItem';
    artscoreHIndexItem.id = artscoreHIndexItemId;
    artscoreHIndexItem.classList.add('artscore-hindex-item', 'artscore-item');
    artscoreRow2.appendChild(artscoreHIndexItem);

    // Create the CiteScore legend div
    const artscoreCiteScoreLegend = document.createElement('div');
    const artscoreCiteScoreLegendId = 'artscoreCiteScoreLegend';
    artscoreCiteScoreLegend.id = artscoreCiteScoreLegendId;
    artscoreCiteScoreLegend.classList.add('artscore-citescore-legend', 'artscore-legend');
    artscoreRow2.appendChild(artscoreCiteScoreLegend);

    // Create the CiteScore item div
    const artscoreCiteScoreItem = document.createElement('div');
    const artscoreCiteScoreItemId = 'artscoreCiteScoreItem';
    artscoreCiteScoreItem.id = artscoreCiteScoreItemId;
    artscoreCiteScoreItem.classList.add('artscore-citescore-item', 'artscore-item');
    artscoreRow2.appendChild(artscoreCiteScoreItem);

    // Create the SJR legend div
    const artscoreSJRLegend = document.createElement('div');
    const artscoreSJRLegendId = 'artscoreSJRLegend';
    artscoreSJRLegend.id = artscoreSJRLegendId;
    artscoreSJRLegend.classList.add('artscore-sjr-legend', 'artscore-legend');
    artscoreRow2.appendChild(artscoreSJRLegend);

    // Create the SJR item div
    const artscoreSJRItem = document.createElement('div');
    const artscoreSJRItemId = 'artscoreSJRItem';
    artscoreSJRItem.id = artscoreSJRItemId;
    artscoreSJRItem.classList.add('artscore-sjr-item', 'artscore-item');
    artscoreRow2.appendChild(artscoreSJRItem);

    // Append the second row to the container
    artscoreContainer.appendChild(artscoreRow2);

    return artscoreContainer;
}

export function display_artscore(row, artData) {
    var col = base_structure();
    col.classList.add("artscore-column");

    // Quartile 
    var itm1 = col.querySelector("#artscoreQuartile");
    itm1.classList.add("artscore-q");

    if (artData["scimago"]["success"]) {
        // Scimago URL
        var url = "https://www.scimagojr.com/journalsearch.php?q=" + artData["scimago"]["url"] + "&tip=sid&clean=0";

        // Quartile
        var tmp = document.createElement("a");
        tmp.href = url;
        tmp.target = "_blank";
        tmp.innerText = artData["scimago"]["categories"][0][1];

        // style
        tmp.classList.add("artscore-q");
        switch (artData["scimago"]["categories"][0][1]) {
            case "Q2":
                tmp.classList.add('artscore-q-2');
                break;
            case "Q3":
                tmp.classList.add('artscore-q-3');
                break;
            case "Q4":
                tmp.classList.add('artscore-q-4');
                break;
            default:
                tmp.classList.add('artscore-q-1');
        }

        itm1.appendChild(tmp);
        itm1.title = artData["scimago"]["categories"][0][0];

        // H-index
        col.querySelector("#artscoreHIndexLegend").innerHTML = "<a href='" + url + "' target='_blank'>h-index</a>";
        col.querySelector("#artscoreHIndexItem").innerHTML = "<a href='" + url + "' target='_blank'>" + artData["scimago"]["hindex"]+ "</a>";


        // SJR 
        col.querySelector("#artscoreSJRLegend").innerHTML = "<a href='" + url + "' target='_blank'>SJR " + artData["scimago"]["year"] + "</a>";
        col.querySelector("#artscoreSJRItem").innerHTML = "<a href='" + url + "' target='_blank'>" + artData["scimago"]["sjr"] + "</a>";
    } 

    // Citation
    if (artData["semantic"]["success"]) {
        //col.querySelector("#artscoreCiteScoreLegend").innerText = "";
        if (artData["semantic"]["citations"] < 2) {
            col.querySelector("#artscoreCitations").title = artData["semantic"]["citations"] + " citation";
        } else {
            col.querySelector("#artscoreCitations").title = artData["semantic"]["citations"] + " citations";
        }
        col.querySelector("#artscoreCitations").innerHTML = "<a href='"+ artData["semantic"]["url"] +"' target='_blank'>" + artData["semantic"]["citations"] + '<i class="fa-solid fa-quote-right"></i>' + "</a>";    
    }

    // Cite score
    if (artData["scopus"]["success"]) {
        col.querySelector("#artscoreCiteScoreLegend").innerHTML = "<a href='" + artData["scopus"]["url"] + "' target='_blank'>CiteScore</a>";
        col.querySelector("#artscoreCiteScoreItem").innerHTML = "<a href='" + artData["scopus"]["url"] + "' target='_blank'>" + artData["scopus"]["score"] + "</a>";    
    }
  
    row.appendChild(col);

    return 0;
}