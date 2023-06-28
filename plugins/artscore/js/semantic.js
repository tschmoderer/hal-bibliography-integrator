const apiUrl = 'https://api.semanticscholar.org/graph/v1/paper/';

export async function fetchArticleData(artDOI) {
    try {
        var url = new URL(apiUrl + artDOI); 
        const param = new URLSearchParams({
            fields: [
                "citationCount",
                "isOpenAccess",
                "url",
            ]
        });
        url.search = param.toString();

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();

        if ((typeof halDebug !== "undefined") && (halDebug)) {
            console.log(data);
            console.log(`Number of citations for the article "${artDOI}": ${data["citationCount"]}`);
        }


        return {
            "nb": data["citationCount"], 
            "src": data["url"],
        };
    } catch (error) {
        console.error('Error fetching article citations:', error);
    }
};