export var globalHBIData = {};

export function create_spinner(id = null) {
    const spinner = document.createElement("div");
    spinner.classList = "hbi-spinner";
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