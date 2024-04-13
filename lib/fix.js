import StringIterator from "./StringIterator.js";

function fix(text, {deleteWhitespace = true} = {}) {
    const iterator = new StringIterator(text);
    const stack = [];
    while (!iterator.done()) {
        const structToken = nextStructToken(iterator, {deleteWhitespace});
        switch (structToken) {
            case '"':
                skipString(iterator);
                break;
            case '{':
            case '[':
                stack.push(structToken);
                break;
            case '}':
                switch (stack.pop()) {
                    case '[':
                        iterator.set(']');
                        break;
                    case undefined:
                        iterator.set('');
                        break;
                }
                break;
            case ']':
                switch (stack.pop()) {
                    case '{':
                        iterator.set('}');
                        break;
                    case undefined:
                        iterator.set('');
                        break;
                }
                break;
        }
    }
    return iterator.toString();
}

function nextStructToken(iterator, {deleteWhitespace = true} = {}) {
    while (!iterator.done()) {
        // delete whitespaces
        skipWhitespace(iterator, {deleteWhitespace});

        // find a struct token
        const char = iterator.next();
        switch (char) {
            case '\r': // We don't like \r
                iterator.set(''); // delete it
                break;
            case '"':
            case '{':
            case '}':
            case '[':
            case ']':
            case ':':
            case ',':
                return char;
            case "'":
            case '“':
            case '”':
            case '‘':
            case '’':
            case '`':
            case '،':
            case '「':
            case '」':
            case '﹁':
            case '﹂':
            case '『':
            case '』':
            case '﹃':
            case '﹄':
                iterator.set('"');
                return '"';
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
                if (iterator.peek() === '/') {
                    // Found '//' comment
                    iterator.set('');
                    while (!iterator.done() && iterator.next() !== '\n') {
                        iterator.set(''); // delete comment
                    }
                }
                break;
        }
    }
    return undefined;
}

function skipString(iterator) {
    while (!iterator.done()) {
        switch (iterator.peek()) {
            case '"':
                iterator.next();
                return;
            case '\\':
                iterator.next();
                break;
        }
        iterator.next();
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

export default fix;