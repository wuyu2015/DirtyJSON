import StringIterator from "./StringIterator.js";

function fix(text) {
    const iterator = new StringIterator(text);
    const stack = [];
    while (!iterator.done()) {
        const structToken = nextStructToken(iterator);
        if (structToken === undefined) {
            break;
        }
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

function nextStructToken(iterator) {
    while (!iterator.done()) {
        const char = iterator.next();
        switch (char) {
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
        }
    }
    return undefined;
}

function skipString(iterator) {
    while (!iterator.done()) {
        switch (iterator.peek()) {
            case '"':
                iterator.next()
                return;
            case '\\':
                iterator.next()
                break;
        }
        iterator.next()
    }
}

export default fix;
