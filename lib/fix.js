import StringIterator from "./StringIterator.js";
import TokenStatus from './TokenStatus.js';
import {isWhitespace, isInvisible, isNumber} from './func.js';

function fix(text, {debug= false} = {}) {
    const iterator = new StringIterator(text);
    const status = new TokenStatus();

    while (true) {
        const token = nextToken(iterator);

        if (debug) {
            console.log(iterator.toString(), iterator.index, token, status);
        }

        switch (token) {
            case '"':
                encounterQuote(iterator, status);
                break;
            case '{':
                encounterOpenBrace(iterator, status);
                break;
            case '[':
                encounterOpenSquare(iterator, status);
                break;
            case '}':
            case ']':
                encounterClosedToken(iterator, status);
                break;
            case ':':
                encounterColon(iterator, status);
                break;
            case ',':
                encounterComma(iterator, status);
                break;
            case undefined:
                encounterEnd(iterator, status);
                // All Done. Return the fixed compact JSON string
                return iterator.toString();
            default:
                encounterLiteral(iterator, status, token);
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
            case '"':
            case "'":
            case '`':
            case '“':
            case '”':
            case '‘':
            case '’':
            case '「':
            case '」':
            case '﹁':
            case '﹂':
            case '『':
            case '』':
            case '﹃':
            case '﹄':
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
                    default:
                        return char;
                }
                break;
            case '':
                // char will be empty if we delete it before
                break;
            default:
                return char;
        }
    }
    iterator.next(); // move iterator.index to iterator.array.length
    return undefined;
}

function skipString(iterator) {
    // change token to '"'
    iterator.set('"');
    const index = iterator.index;
    // find the next '"'
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
                // encounter quote
                if (hasTrailingTokenOrEnd(iterator)) {
                    // string end
                    iterator.set('');
                    iterator.prev();
                    iterator.append('"');
                    return;
                }
                iterator.set('\\"');
                break;
            case "'":
            case "`":
            case '“':
            case '”':
            case '‘':
            case '’':
            case '「':
            case '」':
            case '﹁':
            case '﹂':
            case '『':
            case '』':
            case '﹃':
            case '﹄':
                // encounter abnormal quote, and there is a trailing token, change it to '"'
                if (hasTrailingTokenOrEnd(iterator)) {
                    iterator.set('');
                    iterator.prev();
                    iterator.append('"');
                    return;
                }
                break;
            case '\\':
                iterator.next();
                break;
            default:
                // encounter invisible char, delete it
                if (isInvisible(char)) {
                    iterator.set('');
                    break;
                }
        }
    }
    // not found
    if (index === iterator.index) {
        iterator.set('');
    } else {
        iterator.append('"');
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

function skipUntilQuotation(iterator) {
    while (!iterator.done()) {
        const char = iterator.next();
        if (char === ':' || char === '：') {
            return iterator.prev();
        }
    }
    return iterator.prev();
}

function skipUntilToken(iterator) {
    while (true) {
        switch (nextToken(iterator, {deleteWhitespace: false})) {
            case '{':
            case '}':
            case '[':
            case ']':
            case ':':
            case ',':
            case '"':
            case undefined:
                // move iterator.index back to visible char
                return iterator.prev();
        }
    }
}

function hasTrailingTokenOrEnd(iterator) {
    for (let index = iterator.index + 1; index < iterator.array.length; index++) {
        const value = iterator.array[index];
        if (isWhitespace(value)) {
            continue;
        }
        switch (value) {
            case '}':
            case ']':
            case ':':
            case ',':
                return true;
            default:
                return false;
        }
    }
    // end of iterator
    return true;
}

function encounterQuote(iterator, status) {
    if (!status.expectLiteral) {
        iterator.set('');
        return;
    }
    skipString(iterator);
    if (iterator.get().length) {
        status.encounterLiteral();
    }
}

function encounterOpenBrace(iterator, status) {
    if (!status.expectOpenToken) {
        iterator.set('');
        return;
    }
    status.encounterOpenBrace();
}

function encounterOpenSquare(iterator, status) {
    if (!status.expectOpenToken) {
        iterator.set('');
        return;
    }
    status.encounterOpenSquare();
}

function encounterClosedToken(iterator, status) {
    if (!status.expectClosedToken()) {
        iterator.set('');
        return;
    }
    const peekPrevResult = iterator.peekPrev();
    // delete trailing ','
    if (peekPrevResult.lastChar === ',') {
        iterator.array[peekPrevResult.index] = '';
    }
    if (status.inObject()) {
        // close token should be '}'
        iterator.set('}');
        if (status.expectColon) {
            iterator.array[peekPrevResult.index] += ':null';
        } else if (peekPrevResult.lastChar === ':') {
            iterator.array[peekPrevResult.index] += 'null';
        }
    } else {
        // close token should be ']'
        iterator.set(']');
    }
    status.encounterClosedToken();
}

function encounterColon(iterator, status) {
    if (!status.expectColon) {
        iterator.set('');
        return;
    }
    status.encounterColon();
}

function encounterComma(iterator, status) {
    if (!status.expectComma) {
        iterator.set('');
        return;
    }
    status.encounterComma();
}

function encounterLiteral(iterator, status, token) {
    if (!status.expectLiteral) {
        iterator.set('');
        return;
    }

    if (status.inObject() && !status.hasObjectKey) {
        // encounter non-token char that must be quoted
        // add leading quote
        iterator.set('"' + token);
        // add trailing quote
        iterator.set(skipUntilQuotation(iterator) + '"');
        status.encounterLiteral();
        return;
    }

    status.encounterLiteral();

    // not in object key field
    // prepare to get value from index
    const valueIndex0 = iterator.index;
    skipUntilToken(iterator);
    const valueIndex1 = iterator.index;
    // get value
    const value = iterator.array.slice(valueIndex0, valueIndex1 + 1).join('');
    if (isNumber(value)) {
        // value is number
        // format number
        const numberString = String(Number(value));
        if (numberString !== value) {
            iterator.array[valueIndex0] = numberString;
            for (let i = valueIndex0 + 1; i <= valueIndex1; i++) {
                iterator.array[i] = '';
            }
        }
        return;
    }
    // value is not number
    switch (value.toLowerCase()) {
        case 'true':
        case 'false':
        case 'null':
            for (let index = valueIndex0; index <= valueIndex1; index++) {
                // lower case the bool or null value
                iterator.array[index] = iterator.array[index].toLowerCase()
            }
            break;
        default:
            // value is string, must be quoted
            iterator.array[valueIndex0] = '"' + token;
            iterator.array[valueIndex1] = iterator.get() + '"';
    }
}

function encounterEnd(iterator, status) {
    const peekPrevResult = iterator.peekPrev();
    if (status.hasObjectKey) {
        if (status.expectColon) {
            iterator.array[peekPrevResult.index] += ':null';
        } else {
            iterator.array[peekPrevResult.index] += 'null';
        }
    }
    if (peekPrevResult.lastChar === ',') {
        iterator.array[peekPrevResult.index] = '';
    }
    // empty `stack`
    while (status.stack.length > 0) {
        switch (status.stack.pop()) {
            case '{':
                iterator.array[iterator.array.length - 1] += '}';
                break;
            case '[':
                iterator.array[iterator.array.length - 1] += ']';
                break;
        }
    }
}

export default fix;
