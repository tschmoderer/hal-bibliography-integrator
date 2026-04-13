const hal_api_url = "https://api.archives-ouvertes.fr/search";

export async function callHALAPI(parameters, debug = false) {
    try {
        // Definition des paramètres de la recherche
        const param = new URLSearchParams(parameters);

        // Instanciation de l'url 
        var url = new URL(hal_api_url);
        url.search = param.toString();

        if (debug) {
            console.log(url);
        }

        // Appel de l'API
        const response = await fetch(url);
        const data = await response.json();

        // Return 
        return data.response.docs;
    } catch (error) {
        console.log("HBI ERROR: Call HAL API on url : " + url.toString())
        console.error(error);
    }
}