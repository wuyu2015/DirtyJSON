import assert from 'assert';
import fix from "../lib/fix.js";

function testFix() {
    assert.strictEqual(fix(''), '');
    assert.strictEqual(fix('{}'), '{}');
    assert.strictEqual(fix('[]'), '[]');
    assert.strictEqual(fix('tRue'), 'true');
    assert.strictEqual(fix('FalSE'), 'false');
    assert.strictEqual(fix('nULl'), 'null');
    assert.strictEqual(fix('{'), '{}');
    assert.strictEqual(fix('{  '), '{}');
    assert.strictEqual(fix('  {'), '{}');
    assert.strictEqual(fix('  {  '), '{}');
    assert.strictEqual(fix('}'), '');
    assert.strictEqual(fix('['), '[]');
    assert.strictEqual(fix(']'), '');
    assert.strictEqual(fix(':'), '');
    assert.strictEqual(fix('{{}}'), '{}');
    assert.strictEqual(fix('[[]]'), '[[]]');
    assert.strictEqual(fix('[[], []]'), '[[],[]]');
    assert.strictEqual(fix('{[]}'), '{}');
    assert.strictEqual(fix('{[], []}'), '{}');
    assert.strictEqual(fix('{[}'), '{}');
    assert.strictEqual(fix('{]}'), '{}');
    assert.strictEqual(fix('{:}'), '{}');
    assert.strictEqual(fix('{,}'), '{}');
    assert.strictEqual(fix('{a:}'), '{"a":null}');
    assert.strictEqual(fix('{"a": 1}'), '{"a":1}');
    assert.strictEqual(fix("{'a': 1}"), '{"a":1}');
    assert.strictEqual(fix("{`a`: 1}"), '{"a":1}');
    assert.strictEqual(fix('{”a”: 1}'), '{"a":1}');
    assert.strictEqual(fix("{'a\": 1}"), '{"a":1}');
    assert.strictEqual(fix('{「a」: 1}'), '{"a":1}');
    assert.strictEqual(fix('{「a「: 1}'), '{"a":1}');
    assert.strictEqual(fix('{‘a’: 1}'), '{"a":1}');
    assert.strictEqual(fix("{'\"a\"': 1}"), '{"\\"a\\"":1}');
    assert.strictEqual(fix('{""a"": 1}'), '{"\\"a\\"":1}');
    assert.strictEqual(fix('{\'an "example"\t\b\f\r\n word\': 1}'), '{"an \\"example\\"\\t\\n word":1}');
    assert.strictEqual(fix('{"an "example" word": 1}'), '{"an \\"example\\" word":1}');
    assert.strictEqual(fix("{a: 1}"), '{"a":1}');
    assert.strictEqual(fix('{"a":: 1}'), '{"a":1}');
    assert.strictEqual(fix('{a: 1, c: d}'), '{"a":1,"c":"d"}');
    assert.strictEqual(fix(
        '[1, 2, 3, "a", "b", "c", abc, TrUe, False, NULL, 1.23e10, 123abc, { 123:123 },]'),
        '[1,2,3,"a","b","c","abc",true,false,null,12300000000,"123abc",{"123":123}]');
    assert.strictEqual(fix('[1, 2, 3, a, `b`, c]'), '[1,2,3,"a","b","c"]');
    assert.strictEqual(fix('[1, 2, 3, "a", {b: "c"}]'), '[1,2,3,"a",{"b":"c"}]');
    assert.strictEqual(fix(
        '{"a": 1，\'b\': 2, `c`: 3, “d”: 4, ‘e’: 5, 「f」:6, }'),
        '{"a":1,"b":2,"c":3,"d":4,"e":5,"f":6}');
    assert.strictEqual(fix('{"a": 1, {"b": 2]]'), '{"a":1,"b":2}');
    assert.strictEqual(fix('{,,,"a",,:, 1,,, {,,,"b",: 2,,,],,,],,,'), '{"a":1,"b":2}');
    assert.strictEqual(fix('{"a": 1, b: [2, “3”:}]'), '{"a":1,"b":[2,"3"]}');
    assert.strictEqual(fix('},{「a」:1,,b:[2,,“3”:},]},'), '{"a":1,"b":[2,"3"]}');
    assert.strictEqual(fix('["quotes in "quotes" in quotes"]'), '["quotes in \\"quotes\\" in quotes"]');
    assert.strictEqual(fix('{"a": 1, b:: [2, “3":}] // this is a comment'), '{"a":1,"b":[2,"3"]}');
    assert.strictEqual(fix('},{,key:：/*multiline\ncomment\nhere*/ “//value",】， // this is an abnormal JSON'), '{"key":"//value"}');
}
testFix();

function testValidJson() {
    const validJsons = [
        '',
        'true',
        'false',
        'null',
        '0',
        '1',
        '123',
        '0.1',
        '-1',
        '-123',
        '{}',
        '{"a":1}',
        '{"a":"b"}',
        '{"a":"b","c":"d"}',
        '[]',
        '[1,2,3]',
        '["a","b","c"]',
    ];
    for (const jsonString of validJsons) {
        assert.strictEqual(fix(jsonString), jsonString);
        assert.strictEqual(fix(` ${jsonString}`), jsonString);
        assert.strictEqual(fix(`${jsonString} `), jsonString);
        assert.strictEqual(fix(` ${jsonString} `), jsonString);
        assert.strictEqual(fix(`${jsonString}\n`), jsonString);
        assert.strictEqual(fix(`\n${jsonString}`), jsonString);
        assert.strictEqual(fix(`\n${jsonString}\n`), jsonString);
        assert.strictEqual(fix(`${jsonString}//comment`), jsonString);
        assert.strictEqual(fix(`${jsonString}/*\ncomment\n*/`), jsonString);
    }
}
testValidJson();

function testNumbers() {
    assert.strictEqual(fix('0'), '0');
    assert.strictEqual(fix('1'), '1');
    assert.strictEqual(fix('01'), '1');
    assert.strictEqual(fix('0.10'), '0.1');
    assert.strictEqual(fix('-0'), '0');
    assert.strictEqual(fix('+0'), '0');
    assert.strictEqual(fix('+1'), '1');
    assert.strictEqual(fix('.1'), '0.1');
    assert.strictEqual(fix('.0'), '0');
    assert.strictEqual(fix('-.12'), '-0.12');
    assert.strictEqual(fix('1.23e10'), '12300000000');
}
testNumbers();

function testIncomplete() {
    assert.strictEqual(fix('{a:'), '{"a":null}');
}
testIncomplete();

function testFix1() {
    assert.strictEqual(fix("{ test: 'this is a test', 'number': 1.23e10 }"), '{"test":"this is a test","number":12300000000}');
}
testFix1();

function testFix2() {
    assert.strictEqual(fix('{ "test": "some text "a quote" more text"} '), '{"test":"some text \\"a quote\\" more text"}');
}
testFix2();

function testFix3() {
    assert.strictEqual(fix('{"test": "each \n on \n new \n line"}'), '{"test":"each \\n on \\n new \\n line"}');
}
testFix3();

function testJsonDataWithComments() {
    const jsonDataWithComments = `
        {
            // This is a comment
            "name": "John",
            "age": 30
        }
    `;
    assert.strictEqual(fix(jsonDataWithComments), '{"name":"John","age":30}');
}
testJsonDataWithComments();

function testJsonDataWithTrailingCommas() {
    const jsonDataWithTrailingCommas = `
        {
            "name": "John",
            "age": 30, // Notice this trailing comma
        }
    `;
    assert.strictEqual(fix(jsonDataWithTrailingCommas), '{"name":"John","age":30}');
}
testJsonDataWithTrailingCommas();

function testJsonDataWithMismatch() {
    const jsonDataWithMismatch = `
        {
            "name": "John",
            "age": 30,
            "friends": [
                "Alice",
                "Bob",
            } // this '}' should be ']'
        】// this abnormal square bracket  should be '}'
    `;
    assert.strictEqual(fix(jsonDataWithMismatch), '{"name":"John","age":30,"friends":["Alice","Bob"]}');
}
testJsonDataWithMismatch();

function testUnfinishedJsonData() {
    const unfinishedJsonData = `
        {
            "name": "John",
            "age": 30,
            "friends": [
                "Alice",
                "Bob",`;
    assert.strictEqual(fix(unfinishedJsonData), '{"name":"John","age":30,"friends":["Alice","Bob"]}');
}
testUnfinishedJsonData();

function testImproperlyWrittenJSON() {
    const improperlyWrittenJSON = '},{「a」:1,,b:[2,,“3”:},]},';
    assert.strictEqual(fix(improperlyWrittenJSON), '{"a":1,"b":[2,"3"]}');
}
testImproperlyWrittenJSON();
