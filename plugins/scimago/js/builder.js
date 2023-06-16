// Paris F37
function scimago_quartiles(container, data) {
    for (const d in data["Categories"]) {
        if (d > 3) {
            return container;
        }

        var nb = parseInt(d) + 1; 
        console.log(nb);

        var item = document.createElement("div"); 
        item.classList.add("scimago-quartile-item-" + nb.toString());

        var quarDiv = document.createElement("div"); 
        quarDiv.classList.add("scimago-q"); 
        quarDiv.innerText = data["Categories"][d][1]; 
        switch (data["Categories"][d][1]) {
            case "Q2":
                quarDiv.classList.add('scimago-q-2'); 
              break;
            case "Q3":
                quarDiv.classList.add('scimago-q-3');  
              break;
            case "Q4":
                quarDiv.classList.add('scimago-q-4');
              break;
            default:
                quarDiv.classList.add('scimago-q-1');
          }
        item.appendChild(quarDiv); 

        var cat = document.createElement("div"); 
        cat.classList.add("scimago-quartile-category-" + nb.toString());
        cat.innerHTML = "<div class='scimago-category'>" + data["Categories"][d][0] + "</div>"; 

        container.appendChild(item);
        container.appendChild(cat); 
    }

    const item1 = document.createElement("div"); 
    item1.classList.add("scimago-quartile-item-1");
    const item2 = document.createElement("div"); 
    item2.classList.add("scimago-quartile-item-2");

    return container;
}

function scimago_base_container(data) { 
    // Create the main container element
    const scimagoGrid = document.createElement('div');
    scimagoGrid.classList.add('scimago-grid');

    // Create the individual child elements
    const srjLegend = document.createElement('div');
    srjLegend.classList.add('scimago-srj-legend');
    srjLegend.innerHTML = "<div class='scimago-legend'>SJR 2022</div>";

    const srjData = document.createElement('div');
    srjData.classList.add('scimago-srj-data');
    srjData.innerHTML = "<div class='scimago-data'>"+ data["SJR"] +"</div>";

    const hindexLegend = document.createElement('div');
    hindexLegend.classList.add('scimago-hindex-legend');
    hindexLegend.innerHTML = "<div class='scimago-legend'>h-index</div>";

    const hindexData = document.createElement('div');
    hindexData.classList.add('scimago-hindex-data');
    hindexData.innerHTML = "<div class='scimago-data'>"+ data["H index"] +"</div>";

    const citiesLegend = document.createElement('div');
    citiesLegend.classList.add('scimago-cities-legend');
    citiesLegend.innerHTML = "<div class='scimago-legend'>Citations</div>";

    const citiesData = document.createElement('div');
    citiesData.classList.add('scimago-cities-data');
    citiesData.innerHTML = "<div class='scimago-data'>" +"</div>";

    const quartiles = document.createElement('div');
    quartiles.classList.add('scimago-quartiles');
    scimago_quartiles(quartiles, data);

    // Append the child elements to the main container
    scimagoGrid.appendChild(srjLegend);
    scimagoGrid.appendChild(srjData);
    scimagoGrid.appendChild(hindexLegend);
    scimagoGrid.appendChild(hindexData);
    scimagoGrid.appendChild(citiesLegend);
    scimagoGrid.appendChild(citiesData);
    scimagoGrid.appendChild(quartiles);

    // Append the main container to the document body or any desired parent element
    return scimagoGrid;
}


export function make_scimago_container(data) {
    var base = scimago_base_container(data);
    return base;
}