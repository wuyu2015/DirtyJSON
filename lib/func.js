function isWhitespace(char) {
    // \x20: Space
    // \x7F: DEL
    // \xA0: Non-breaking Space
    // \u2000-\u200A: En Quad, Em Quad, En Space, Em Space, Three-Per-Em Space, Four-Per-Em Space, Six-Per-Em Space, Figure Space, Punctuation Space, Thin Space, Hair Space
    // \u2028: Line Separator
    // \u205F: Medium Mathematical Space
    // \u3000: Ideographic Space
    return /[\x00-\x20\x7F\xA0\u2000-\u200A\u2028\u205F\u3000]/.test(char);
}

function isInvisible(char) {
    // \x09: \t
    // \x0A: \n
    // \x7F: DEL
    return /[\x00-\x08\x0B-\x1F\x7F]/.test(char);
}

function isNumber(str) {
    return /^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(str);
}

export {
    isWhitespace,
    isInvisible,
    isNumber,
};
