import '../scss/main.scss';

import { scimago_data } from '../data/scimagojr 2022';
import { make_scimago_container } from './builder';

//TODO: add to every row two column 

function toggleScimago(col, id) {
  var elem = document.getElementById(id);
  var icon = col.firstChild;

  if (elem.classList.contains('scimago-hide')) {
    elem.classList.remove('scimago-hide');
    elem.classList.add('scimago-show');

    icon.classList.add("scimago-icon-rotate");
    col.classList.remove("scimago-button-hover");
  } else {
    elem.classList.remove('scimago-show');
    elem.classList.add('scimago-hide');

    icon.classList.remove("scimago-icon-rotate");
    col.classList.add("scimago-button-hover");
  }
}

function make_scimago_collapsable(article_row, scimago_container, halId) {
  var button = document.createElement("td"); 
  button.classList = "scimago-button scimago-button-hover";
  var icon = document.createElement("i");
  icon.classList = "scimago-icon fa-solid fa-caret-left";
  button.onclick = function() {
      toggleScimago(this, 'scimago-' + halId);
  };

  button.appendChild(icon); 
  article_row.appendChild(button); 

  var new_container = document.createElement("td");
  new_container.id = 'scimago-' + halId;
  new_container.classList = "scimago-column scimago-show";
  new_container.appendChild(scimago_container);
  article_row.appendChild(new_container);
}

function add_scimago(data) {
  var row = document.getElementById("row-" + data["halId_s"]);
  console.log(row);

  var title = data["journalTitle_s"];
  if (title in hal_plugins["scimago"]){
    title = hal_plugins["scimago"][title];
  }

  for (const s in scimago_data) { 
    if (scimago_data[s]["Title"] === title) {
      console.log(scimago_data[s]);
      var ctnr = make_scimago_container(scimago_data[s]);
      make_scimago_collapsable(row, ctnr, data["halId_s"]);
    }
  }
}

function HALscimago() {
  var data = globalHalData["ART"];
  for (const d in data) {
    console.log(data[d]);
    add_scimago(data[d]);
  }
}


document.addEventListener("halMainDone", () => {
  if ((typeof halDebug !== "undefined") && (halDebug)) {
    console.log("Create Scimago data");
  }
  HALscimago();
});
