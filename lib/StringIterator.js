import {isWhitespace} from './func.js';

class StringIterator {
    constructor(string) {
        this.array = string.split('');
        this.index = -1
    }

    next() {
        return this.array[++this.index];
    }

    prev() {
        for (let index = this.index - 1; index >= 0; index--) {
            const value = this.array[index];
            if (value.length && !isWhitespace(value)) {
                this.index = index;
                return value;
            }
        }
        return undefined;
    }

    peek(n = 1) {
        return this.array[this.index + n];
    }

    peekPrev() {
        for (let index = this.index - 1; index >= 0; index--) {
            const value = this.array[index].trim();
            if (value.length && !isWhitespace(value)) {
                return { index, value, lastChar: value.slice(-1) };
            }
        }
        return { index: -1, value: undefined, lastChar: undefined };
    }

    get() {
        return this.array[this.index];
    }

    set(char) {
        this.array[this.index] = char;
    }

    append(char) {
        this.array[this.index] += char;
    }

    done() {
        return this.index >= this.array.length - 1;
    }

    toString() {
        return this.array.join('');
    }
}

export default StringIterator;
