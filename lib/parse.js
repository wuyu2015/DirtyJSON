import JSON5 from 'json5';
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
    let jsonObject;
    try {
        jsonObject = JSON5.parse(text);
    } catch (err) {
        return JSON5.parse(fix(text));
    }
    return jsonObject;
}

export default parse;
