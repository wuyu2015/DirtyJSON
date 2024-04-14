import fix from './fix.js';

function parse(text) {
    let jsonObject;
    try {
        jsonObject = JSON.parse(text);
    } catch (err) {
        return dirtyParse(text);
    }
    return jsonObject;
}

function dirtyParse(text) {
    return JSON.parse(fix(text));
}

export default parse;
