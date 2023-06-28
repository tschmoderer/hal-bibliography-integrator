// Paris F37
function artscore_quartiles(container, data) {
    for (const d in data["Categories"]) {
        if (d > 3) {
            return container;
        }

        var nb = parseInt(d) + 1; 

        var item = document.createElement("div"); 
        item.classList.add("artscore-quartile-item-" + nb.toString());

        var quarDiv = document.createElement("div"); 
        quarDiv.classList.add("artscore-q"); 
        quarDiv.innerText = data["Categories"][d][1]; 
        switch (data["Categories"][d][1]) {
            case "Q2":
                quarDiv.classList.add('artscore-q-2'); 
              break;
            case "Q3":
                quarDiv.classList.add('artscore-q-3');  
              break;
            case "Q4":
                quarDiv.classList.add('artscore-q-4');
              break;
            default:
                quarDiv.classList.add('artscore-q-1');
          }
        item.appendChild(quarDiv); 

        var cat = document.createElement("div"); 
        cat.classList.add("artscore-quartile-category-" + nb.toString());
        cat.innerHTML = "<div class='artscore-category'>" + data["Categories"][d][0] + "</div>"; 

        container.appendChild(item);
        container.appendChild(cat); 
    }

    const item1 = document.createElement("div"); 
    item1.classList.add("artscore-quartile-item-1");
    const item2 = document.createElement("div"); 
    item2.classList.add("artscore-quartile-item-2");

    return container;
}

function artscore_base_container(data) { 
    // Create the main container element
    const artscoreGrid = document.createElement('div');
    artscoreGrid.classList.add('artscore-grid');

    // Create the individual child elements
    const srjLegend = document.createElement('div');
    srjLegend.classList.add('artscore-srj-legend');
    srjLegend.innerHTML = "<div class='artscore-legend'>SJR 2022</div>";

    const srjData = document.createElement('div');
    srjData.classList.add('artscore-srj-data');
    srjData.innerHTML = "<div class='artscore-data'>"+ data["SJR"] +"</div>";

    const hindexLegend = document.createElement('div');
    hindexLegend.classList.add('artscore-hindex-legend');
    hindexLegend.innerHTML = "<div class='artscore-legend'>h-index</div>";

    const hindexData = document.createElement('div');
    hindexData.classList.add('artscore-hindex-data');
    hindexData.innerHTML = "<div class='artscore-data'>"+ data["H index"] +"</div>";

    const citiesLegend = document.createElement('div');
    citiesLegend.classList.add('artscore-cities-legend');
    citiesLegend.innerHTML = "<div class='artscore-legend'>Citations</div>";

    const citiesData = document.createElement('div');
    citiesData.classList.add('artscore-cities-data');
    citiesData.innerHTML = "<div class='artscore-data'>" +"</div>";

    const quartiles = document.createElement('div');
    quartiles.classList.add('artscore-quartiles');
    artscore_quartiles(quartiles, data);

    // Append the child elements to the main container
    artscoreGrid.appendChild(srjLegend);
    artscoreGrid.appendChild(srjData);
    artscoreGrid.appendChild(hindexLegend);
    artscoreGrid.appendChild(hindexData);
    artscoreGrid.appendChild(citiesLegend);
    artscoreGrid.appendChild(citiesData);
    artscoreGrid.appendChild(quartiles);

    // Append the main container to the document body or any desired parent element
    return artscoreGrid;
}


export function make_artscore_container(data) {
    var base = artscore_base_container(data);
    return base;
}