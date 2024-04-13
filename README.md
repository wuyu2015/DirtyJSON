# DirtyJSON

DirtyJSON is a Node.js library designed for fixing and parsing invalid JSON data.

Douglas Crockford created and promoted the JSON format with the intention of providing a strict, user-friendly, and standardized data format, where syntax errors are not allowed. JSON output by programs is also expected to be flawless (as it ideally shouldn't be hand-written). However, with the emergence of artificial intelligence like ChatGPT, instances of incorrect JSON output have been observed. In my existing data, out of 80,000 conversations, approximately 4,000 outputs were in an incorrect JSON format. DirtyJSON attempts to rectify some of the errors in JSON generated by AI.


DirtyJSON 可以为你解析非法的 JSON 数据。

Douglas Crockford 创建和推广 JSON 格式的初衷是提供一种严格、易用、统一的数据格式，语法错误等是不被允许的。通过程序生成的 JSON 完美无暇（这本来就不应该是手写的格式），直到人工智能 ChatGPT 出现，让它输出 JSON 的时候，在我已有的数据看来，8 万次对话有 4000 次输出了错误格式的 JSON，DirtyJSON 试图修复一些 AI 生成 JSON 的错误。

## Installation

```bash
npm install @wu__yu/dirtyjson
```

## Usage

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';

const text = '},{,key:： “value"，】, // comment in JSON: this is an abnormal JSON';
console.log(DirtyJSON.fix(text));
// Output: {"key":"value"}
```

Here's the test.js file in the project:

```javascript
import assert from 'assert';
import fix from "../lib/fix.js";

function testFix() {
    assert.strictEqual(fix(''), '');
    assert.strictEqual(fix('{}'), '{}');
    assert.strictEqual(fix('[]'), '[]');
    assert.strictEqual(fix('True'), 'true');
    assert.strictEqual(fix('falSe'), 'false');
    assert.strictEqual(fix('Null'), 'null');
    assert.strictEqual(fix('{'), '');
    assert.strictEqual(fix('}'), '');
    assert.strictEqual(fix('['), '');
    assert.strictEqual(fix(']'), '');
    assert.strictEqual(fix(':'), '');
    assert.strictEqual(fix('{"a": 1}'), '{"a":1}');
    assert.strictEqual(fix("{'a': 1}"), '{"a":1}');
    assert.strictEqual(fix("{a: 1}"), '{"a":1}');
    assert.strictEqual(fix('{"a":: 1}'), '{"a":1}');
    assert.strictEqual(fix('{a: 1, c: d}'), '{"a":1,"c":"d"}');
    assert.strictEqual(fix('[1, 2, 3, "a", "b", "c", abc, TrUe, False, NULL, 1.23e10, {1:2},]'), '[1,2,3,"a","b","c","abc",true,false,null,1.23e10,{"1":2}]');
    assert.strictEqual(fix('[1, 2, 3, a, `b`, c]'), '[1,2,3,"a","b","c"]');
    assert.strictEqual(fix('[1, 2, 3, "a", {b: "c"}]'), '[1,2,3,"a",{"b":"c"}]');
    assert.strictEqual(fix('{"a": 1，\'b\': 2, `c`: 3, “d”: 4, ‘e’: 5, 「f」：6, ·g·: 7}'), '{"a":1,"b":2,"c":3,"d":4,"e":5,"f":6,"g":7}');
    assert.strictEqual(fix('{"a": 1, {"b": 2]]'), '{"a":1,{"b":2}}');
    assert.strictEqual(fix('{,,,"a",,:, 1,,, {,,,"b",: 2,,,],,,],,,'), '{"a":1,{"b":2}}');
    assert.strictEqual(fix('{"a": 1, b: [2, “3”:}]'), '{"a":1,"b":[2,"3"]}');
    assert.strictEqual(fix('{"a": 1, b:: [2, “3":}] // this is a comment'), '{"a":1,"b":[2,"3"]}');
    assert.strictEqual(fix('},{,key:： “value"，】, // comment in JSON: this is an abnormal JSON'), '{"key":"value"}');
}
testFix();

```

## License

MIT License
