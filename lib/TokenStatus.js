class TokenStatus {
    constructor() {
        this.stack = [];
        this.expectLiteral = true;
        this.expectOpenToken = true;
        this.expectColon = false;
        this.expectComma = false;
        this.hasObjectKey = false;
    }

    lastStack() {
        return this.stack[this.stack.length - 1];
    }

    inObject() {
        return this.lastStack() === '{';
    }

    inArray() {
        return this.lastStack() === '[';
    }

    expectClosedToken() {
        return this.stack.length > 0;
    }

    // {
    encounterOpenBrace() {
        this.stack.push('{');
        this.expectLiteral = true;
        this.expectOpenToken = false;
        this.expectColon = false;
        this.expectComma = false;
        this.hasObjectKey = false;
    }

    // [
    encounterOpenSquare() {
        this.stack.push('[');
        this.expectLiteral = true;
        this.expectOpenToken = true;
        this.expectColon = false;
        this.expectComma = false;
        this.hasObjectKey = false;
    }

    // } or ]
    encounterClosedToken() {
        this.stack.pop();
        this.expectLiteral = false;
        this.expectOpenToken = !this.inObject();
        this.expectColon = false;
        this.expectComma = true;
        this.hasObjectKey = false;
    }

    // :
    encounterColon() {
        this.expectLiteral = true;
        this.expectOpenToken = true;
        this.expectColon = false;
        this.expectComma = false; // not allow: ':,'
        this.hasObjectKey = true;
    }

    // ,
    encounterComma() {
        this.expectLiteral = true;
        this.expectOpenToken = !this.inObject();
        this.expectColon = false;
        this.expectComma = false;
        this.hasObjectKey = false;
    }

    encounterLiteral() {
        this.expectLiteral = false;
        this.expectOpenToken = false;
        if (this.inObject()) {
            this.hasObjectKey = !this.hasObjectKey;
            this.expectColon = this.hasObjectKey;
            this.expectComma = !this.expectColon;
        } else {
            this.expectColon = false;
            this.expectComma = true;
            this.hasObjectKey = false;
        }
    }
}

export default TokenStatus;
