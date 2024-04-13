class StringIterator {
    constructor(string) {
        this.array = string.split('');
        this.index = -1
    }

    next() {
        return this.index < this.array.length - 1 ? this.array[++this.index] : undefined;
    }

    peek(n = 1) {
        return this.array[this.index + n];
    }

    peekPrev() {
        for (let index = this.index - 1; index >= 0; index--) {
            if (this.array[index].length) {
                return this.array[index];
            }
        }
        return undefined;
    }

    get() {
        return this.array[this.index];
    }

    set(char) {
        this.array[this.index] = char;
    }

    done() {
        return this.index >= this.array.length - 1;
    }

    toString() {
        return this.array.join('');
    }
}

export default StringIterator;
