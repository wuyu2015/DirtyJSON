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
            if (this.array[index].length) {
                this.index = index;
                return this.array[index];
            }
        }
        return undefined;
    }

    peek(n = 1) {
        return this.array[this.index + n];
    }

    peekPrev() {
        for (let index = this.index - 1; index >= 0; index--) {
            if (this.array[index].length) {
                return { index, value: this.array[index] };
            }
        }
        return { index: -1, value: undefined };
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
