import assert from 'assert';
import fix from "../lib/fix.js";

function testFix() {
    assert.strictEqual(fix(''), '');
    assert.strictEqual(fix('{}'), '{}');
    assert.strictEqual(fix('[]'), '[]');
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
    assert.strictEqual(fix('[1, 2, 3, "a", "b", "c", abc,]'), '[1,2,3,"a","b","c","abc"]');
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
