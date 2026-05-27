function cleanJson(text){
    if(!text) return null;

    return text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
}

function safeJsonParse(text){
    try{
        return JSON.parse(cleanJson(text));
    } catch {
        return null;
    }
}

function normalizeSummary(text){
    if (!text) return "";

    return text
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

module.exports = {
  cleanJson,
  safeJsonParse,
  normalizeSummary,
};