import StringIterator from "./StringIterator.js";
import {isWhitespace, isInvisible, isNumber} from './func.js';

function fix(text) {
    const iterator = new StringIterator(text);
    // `stack` contains '{' or '['
    const stack = [];
    // is chars in object key field
    let inObjectKey = false;
    // is chars in object value field
    let inObjectValue = false;
    while (true) {
        const token = nextToken(iterator);
        const peekPrevResult = iterator.peekPrev();
        switch (token) {
            case '"':
                // encounter quote
                iterator.set('"');
                skipString(iterator);
                iterator.set('"');
                break;
            case '{':
                // encounter '{'
                if (inObjectKey) {
                    // encounter '{{', delete the last '{'
                    iterator.set('');
                    break;
                }
                stack.push({ index: iterator.index, value: '{'});
                inObjectKey = true;
                inObjectValue = false;
                break;
            case '[':
                // encounter '['
                if (inObjectKey) {
                    // encounter '{[', delete '['
                    iterator.set('');
                    break;
                }
                stack.push({ index: iterator.index, value: '['});
                inObjectKey = false;
                inObjectValue = false;
                break;
            case '}':
                // encounter '}'
                switch (peekPrevResult.lastChar) {
                    case ',':
                        // encounter ',}', delete the trailing comma
                        iterator.array[peekPrevResult.index] = '';
                        break;
                    case ':':
                        // encounter '...:', change it to '...:null'
                        iterator.array[peekPrevResult.index] += 'null';
                        break;
                    case undefined:
                        // encounter something like '   }', delete it
                        for (let i = 0; i <= iterator.index; i++) {
                            iterator.array[i] = '';
                        }
                        break;
                }
                if (!stack.length) {
                    // '}' is invalid here, delete it
                    iterator.set('');
                    break;
                }
                if (stack.pop().value === '[') {
                    // '}' should be ']' here
                    iterator.set(']');
                }
                inObjectKey = false;
                inObjectValue = false;
                break;
            case ']':
                // encounter ']'
                if (inObjectKey) {
                    // encounter '{]', delete ']'
                    iterator.set('');
                    break;
                }
                switch (peekPrevResult.lastChar) {
                    case ',':
                        // encounter ',]', delete the trailing comma
                        iterator.array[peekPrevResult.index] = '';
                        break;
                    case undefined:
                        // encounter something like '   ]', delete it
                        for (let i = 0; i <= iterator.index; i++) {
                            iterator.array[i] = '';
                        }
                        break;
                }
                if (!stack.length) {
                    // ']' is invalid here, delete it
                    iterator.set('');
                    break;
                }
                if (stack.pop().value === '{') {
                    // ']' should be '}' here
                    iterator.set('}');
                }
                inObjectKey = false;
                inObjectValue = false;
                break;
            case ':':
                // encounter ':'
                if (!stack.length || stack[stack.length - 1].value !== '{' || inObjectValue || peekPrevResult.lastChar === '{') {
                    // encounter ':' outside of object or when looking for value or the object is empty, delete it
                    iterator.set('');
                    break;
                }
                inObjectKey = false;
                // only ':' can toggle `inObjectValue` to true
                inObjectValue = true;
                break;
            case ',':
                // encounter ','
                if (inObjectKey) {
                    // encounter '{,', delete ','
                    iterator.set('');
                    break;
                }
                switch (peekPrevResult.lastChar) {
                    case '{':
                    case '[':
                    case ':':
                    case ',':
                        // encounter '{,' or '[,' or ':,' or ',,', delete it
                        iterator.set('');
                        break;
                    case undefined:
                        // encounter something like '   ,', delete it
                        for (let i = 0; i <= iterator.index; i++) {
                            iterator.array[i] = '';
                        }
                        break;
                    default:
                        // encounter 'someOtherChar,', skip the trailing whitespaces
                        skipWhitespace(iterator, {deleteWhitespace: true});
                        switch (iterator.peek()) {
                            case '}': // encounter ',}'
                            case ']': // encounter ',]'
                            case ',': // encounter ',,'
                            case undefined:
                                iterator.set('');
                                break;
                            case ':':
                                // encounter ',:'
                                if (inObjectKey) {
                                    // change to ':'
                                    iterator.set('');
                                } else {
                                    // change to ','
                                    iterator.array[iterator.index + 1] = '';
                                }
                                break;
                            default:
                                // encounter 'otherChar,'
                                // ',' can toggle `inObjectKey` to true
                                inObjectKey = stack.length && stack[stack.length - 1].value === '{';
                                inObjectValue = false;
                        }
                }
                break;
            case undefined:
                // encounter end
                switch (peekPrevResult.lastChar) {
                    case ':': // encounter 'property:'
                        // change it to 'property:null';
                        iterator.array[peekPrevResult.index] = ':null';
                        break;
                    case ',': // encounter '...,'
                        // delete it
                        iterator.array[peekPrevResult.index] = '';
                        break;
                }
                // empty `stack`
                while (stack.length) {
                    switch (stack.pop().value) {
                        case '{':
                            // encounter unfinished object
                            iterator.array[iterator.array.length - 1] += '}';
                            break;
                        case '[':
                            // encounter unfinished array
                            iterator.array[iterator.array.length - 1] += ']';
                            break;
                    }
                }
                // All Done. Return the fixed compact JSON string
                return iterator.toString();
            default:
                // encounter non-token char
                // in object key field
                if (inObjectKey) {
                    // chars in object key field must be quoted
                    // add leading quote
                    iterator.set('"' + token);
                    // add trailing quote
                    iterator.set(skipUntilQuotation(iterator) + '"');
                    break;
                }
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
                    break;
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
                if (hasTokenAfterQuote(iterator)) {
                    // string end
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
                if (hasTokenAfterQuote(iterator)) {
                    iterator.set('"');
                    return;
                }
                break;
            case '\\':
                break;
            default:
                // encounter invisible char, delete it
                if (isInvisible(char)) {
                    iterator.set('');
                    break;
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

function skipUntilQuotation(iterator) {
    while (!iterator.done()) {
        const char = iterator.next();
        if (char === ':' || char === '：') {
            return iterator.prev();
        }
    }
}

function skipUntilToken(iterator) {
    while (true) {
        switch (nextToken(iterator)) {
            case '{':
            case '}':
            case '[':
            case ']':
            case ':':
            case ',':
            case undefined:
                // move iterator.index back to visible char
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
    return false;
}

export default fix;
