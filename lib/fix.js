import StringIterator from "./StringIterator.js";

const tokenSet = new Set([
    '{', '}', '[', ']', ':', ',', '\r', '\n', '\t',
    '“', '”', '‘', '’', '「', '」', '﹁', '﹂', '『', '』', '﹃', '﹄',
    '【', '〔', '】', '〕',
    '：', '，', '、', '/',
]);

const tokenSetAfterQuote = new Set([
    '}', ']', ':', ',',
]);

function fix(text, {deleteWhitespace = true} = {}) {
    const iterator = new StringIterator(text);
    const stack = [];
    let inObjectKey = false;
    let inObjectValue = false;
    while (true) {
        const token = nextToken(iterator, {deleteWhitespace});
        const peekPrevResult = iterator.peekPrev();
        switch (token) {
            case '"':
            case "'":
            case '`':
            case '”':
            case '’':
            case '·':
            case '」':
            case '﹂':
            case '』':
            case '﹄':
                iterator.set('"');
                skipString(iterator, token);
                iterator.set('"');
                break;
            case '{':
                stack.push({ index: iterator.index, value: '{'});
                inObjectKey = true;
                inObjectValue = false;
                break;
            case '[':
                stack.push({ index: iterator.index, value: '['});
                inObjectKey = false;
                inObjectValue = false;
                break;
            case '}':
                switch (peekPrevResult.value) {
                    case ',':
                        iterator.array[peekPrevResult.index] = '';
                        break;
                    case undefined:
                        iterator.set('');
                        break;
                }
                if (!stack.length) {
                    iterator.set('');
                    break;
                }
                switch (stack.pop().value) {
                    case '[':
                        iterator.set(']');
                        break;
                }
                inObjectKey = false;
                inObjectValue = false;
                break;
            case ']':
                switch (peekPrevResult.value) {
                    case ',':
                        iterator.array[peekPrevResult.index] = '';
                        break;
                    case undefined:
                        iterator.set('');
                        break;
                }
                if (!stack.length) {
                    iterator.set('');
                    break;
                }
                switch (stack.pop().value) {
                    case '{':
                        iterator.set('}');
                        break;
                }
                inObjectKey = false;
                inObjectValue = false;
                break;
            case ':':
                if ((stack.length && stack[stack.length - 1].value !== '{') || inObjectValue) {
                    // Encounter ':' outside of an object or when looking for value, which is invalid.
                    iterator.set(''); // delete ':'
                    break;
                }
                inObjectKey = false;
                inObjectValue = true;
                break;
            case ',':
                switch (peekPrevResult.value) {
                    case '{':
                    case '[':
                    case ':':
                    case ',':
                    case undefined:
                        iterator.set('');
                        break;
                    default:
                        skipWhitespace(iterator, {deleteWhitespace});
                        switch (iterator.peek()) {
                            case '}':
                            case ']':
                            case ':':
                            case ',':
                            case undefined:
                                iterator.set('');
                                break;
                            default:
                                inObjectKey = stack.length && stack[stack.length - 1].value === '{';
                                inObjectValue = false;
                        }
                }
                break;
            case undefined:
                switch (peekPrevResult.value) {
                    case '{':
                    case '[':
                    case ':':
                    case ',':
                        iterator.array[peekPrevResult.index] = '';
                        break;
                }
                return iterator.toString();
            default:
                if (inObjectKey) {
                    iterator.set('"' + token);
                    iterator.set(skipUntilComma(iterator) + '"');
                    break;
                }
                // in value
                const valueIndex0 = iterator.index;
                skipUntilToken(iterator);
                const valueIndex1 = iterator.index;
                const value = iterator.array.slice(valueIndex0, valueIndex1 + 1).join('');
                if (isNumber(value)) {
                    break;
                }
                switch (value.toLowerCase()) {
                    case 'true':
                    case 'false':
                    case 'null':
                        for (let index = valueIndex0; index <= valueIndex1; index++) {
                            iterator.array[index] = iterator.array[index].toLowerCase()
                        }
                        break;
                    default:
                        iterator.array[valueIndex0] = '"' + token;
                        iterator.array[valueIndex1] = iterator.get() + '"';
                }
        }
    }
}

function nextToken(iterator, {deleteWhitespace = true} = {}) {
    while (!iterator.done()) {
        // delete whitespaces
        skipWhitespace(iterator, {deleteWhitespace});

        // find a struct token
        const char = iterator.next();
        switch (char) {
            case '“':
            case '”':
                return '”';
            case '‘':
            case '’':
                return '’';
            case '「':
            case '」':
                return '」';
            case '﹁':
            case '﹂':
                return '﹂';
            case '『':
            case '』':
                return '』';
            case '﹃':
            case '﹄':
                return '﹄';
            case '【':
            case '〔':
                iterator.set('[');
                return '[';
            case '】':
            case '〕':
                iterator.set(']');
                return ']';
            case '：':
                iterator.set(':');
                return ':';
            case '，':
            case '、':
                iterator.set(',');
                return ',';
            case '/':
                switch (iterator.peek()) {
                    case '/':
                        // Found '//' comment
                        iterator.set('');
                        while (!iterator.done() && iterator.next() !== '\n') {
                            iterator.set(''); // delete comment
                        }
                        if (iterator.get() === '\n') {
                            iterator.set(''); // delete \n
                        }
                        break;
                    case '*':
                        // Found '/*' comment
                        iterator.set('');  // delete '/'
                        iterator.next();
                        iterator.set('');  // delete '*'
                        while (!iterator.done()) {
                            if (iterator.next() === '*' && iterator.peek() === '/') {
                                iterator.set(''); // delete '*'
                                iterator.next();
                                iterator.set(''); // delete '/'
                                break;
                            }
                            iterator.set(''); // delete comment
                        }
                        break;
                }
                break;
            default:
                return char;
        }
    }
    iterator.next(); // move iterator.index to iterator.array.length
    return undefined;
}

function skipString(iterator, quote = '"') {
    while (!iterator.done()) {
        const char = iterator.next();
        switch (char) {
            case '\n':
                iterator.set('\\n');
                break;
            case '\t':
                iterator.set('\\t');
                break;
            case '"':
                switch (quote) {
                    case "'":
                    case "`":
                        iterator.set('\\"');
                        break;
                    default:
                        if (hasTokenAfterQuote(iterator)) {
                            return;
                        }
                        iterator.set('\\"');
                }
                break;
            case '\\':
                break;
            default:
                if (isInvisible(char)) {
                    iterator.set('');
                    break;
                }
                // encountering quotation mark
                if (char === quote && hasTokenAfterQuote(iterator)) {
                    iterator.set('"');
                    return;
                }
        }
    }
}

function skipWhitespace(iterator, {deleteWhitespace = false} = {}) {
    while (!iterator.done()) {
        if (!isWhitespace(iterator.peek())) {
            return;
        }
        iterator.next();
        if (deleteWhitespace) {
            iterator.set('');
        }
    }
}

function skipUntilComma(iterator) {
    while (!iterator.done()) {
        const char = iterator.next();
        if (char === ':' || char === '：') {
            return iterator.prev();
        }
    }
}

function skipUntilToken(iterator) {
    while (!iterator.done()) {
        if (tokenSet.has(iterator.next())) {
            return iterator.prev();
        }
    }
}

function hasTokenAfterQuote(iterator) {
    for (let index = iterator.index + 1; index < iterator.array.length; index++) {
        const value = iterator.array[index];
        if (isWhitespace(value)) {
            continue;
        }
        return tokenSetAfterQuote.has(value);
    }
    return false;
}

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

export default fix;
