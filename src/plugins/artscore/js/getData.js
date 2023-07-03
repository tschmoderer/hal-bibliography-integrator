import { fetchJournalData } from "./scopus";
import { fetchArticleData } from "./semantic";
import { fetchJournalQuartile } from "./scimago";
import { scimago_year } from "../data/scimagojr 2022";
/*
- Call the different API to get data about article 
    - Call Elsevier scopus for CiteScore
    - Call SemanticScholar for Citations 
    - Fetch Scimago data for Impactfactor 
    - Call XX api for Impact Factor (or h-index?)
*/
export async function get_artdata(articleData) {
    var res = {
        "scopus": {
            "success": false,
            "score": 0,
            "url": "",
        },

        "semantic": {
            "success": false,
            "citations": 0,
            "url": "",
        },

        "scimago": {
            "success": false,
            "categories": [],
            "sjr": 0,
            "year": scimago_year,
            "hindex": 0,
            "url": "",
        }
    };

    try {
        const tmp1 = await fetchJournalData(articleData["journalIssn_s"]);
        res["scopus"]["success"] = true;
        res["scopus"]["score"] = tmp1["score"];
        res["scopus"]["url"] = tmp1["url"];

        try {
            const tmp2 = await fetchJournalQuartile(articleData["journalTitle_s"]);

            res["scimago"]["success"] = true;
            res["scimago"]["categories"] = tmp2["Categories"];
            res["scimago"]["sjr"] = tmp2["SJR"];
            res["scimago"]["hindex"] = tmp2["H index"];
            res["scimago"]["url"] = tmp2["Sourceid"];
        } catch (error) {
            console.log(error);
        }

        const tmp3 = await fetchArticleData(articleData["doiId_s"]);
        res["semantic"]["success"] = true;
        res["semantic"]["citations"] = tmp3["nb"];
        res["semantic"]["url"] = tmp3["src"];

        return res;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
